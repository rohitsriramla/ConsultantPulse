import os
import sys
import time
import argparse
from datetime import datetime
from decimal import Decimal
from sqlalchemy import create_engine, text
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://devtimer_user:devtimer_secret_password@localhost:5432/devtimer_db")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

engine = create_engine(DATABASE_URL)

def generate_ai_summary(raw_notes_list):
    if not raw_notes_list:
        return "Standard professional consulting and engineering deliverables."
    combined = "\n".join(filter(None, raw_notes_list))
    if not combined:
        return "Engineering development and optimization tasks."

    if OPENAI_API_KEY and OPENAI_API_KEY != "your_openai_api_key_here":
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an executive billing assistant. Summarize technical developer notes into 2 concise, polished bullet points for a client invoice."},
                    {"role": "user", "content": f"Developer notes:\n{combined}"}
                ],
                max_tokens=120
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[WARN] OpenAI call failed: {e}. Falling back to rule-based summary.")

    lines = [line.strip().lstrip("-*• ") for line in combined.split("\n") if line.strip()]
    top_items = lines[:3]
    return "\n".join([f"• {item}" for item in top_items])

def generate_invoice_pdf(client_info, entries, invoice_num, output_path, total_amount, total_hours):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        'InvoiceTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#0f172a'), spaceAfter=6
    )
    story.append(Paragraph(f"INVOICE #{invoice_num}", title_style))
    story.append(Paragraph(f"<b>Date:</b> {datetime.utcnow().strftime('%B %d, %Y')}", styles['Normal']))
    story.append(Spacer(1, 15))

    client_box = [
        [
            Paragraph(f"<b>Billed To:</b><br/>{client_info['name']}<br/>{client_info['company']}<br/>{client_info.get('email', '')}", styles['Normal']),
            Paragraph(f"<b>Payable To:</b><br/>DevTimer Consultant Services<br/>Rate: ${client_info['hourly_rate']}/hr {client_info['currency']}", styles['Normal'])
        ]
    ]
    t_box = Table(client_box, colWidths=[270, 270])
    t_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t_box)
    story.append(Spacer(1, 20))

    table_data = [["Date", "Task & Deliverables", "Hours", "Rate", "Subtotal"]]
    for entry in entries:
        subtotal = float(entry['duration_hours']) * float(client_info['hourly_rate'])
        date_str = entry['start_time'].strftime('%Y-%m-%d')
        notes = entry['ai_summary'] or entry['task_name']
        table_data.append([
            date_str,
            Paragraph(f"<b>{entry['task_name']}</b><br/><font color='#64748b' size='8'>{notes}</font>", styles['Normal']),
            f"{float(entry['duration_hours']):.2f}",
            f"${client_info['hourly_rate']}",
            f"${subtotal:.2f}"
        ])

    table_data.append(["", "<b>Total Billable Deliverables</b>", f"<b>{total_hours:.2f} hrs</b>", "", f"<b>${total_amount:.2f}</b>"])

    t_entries = Table(table_data, colWidths=[70, 250, 60, 60, 90])
    t_entries.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f1f5f9')),
        ('PADDING', (0, 1), (-1, -1), 6),
    ]))
    story.append(t_entries)
    story.append(Spacer(1, 25))

    footer_style = ParagraphStyle('Footer', parent=styles['Italic'], fontSize=9, textColor=colors.HexColor('#64748b'))
    story.append(Paragraph("Thank you for your business. Payment is due within 15 business days of receipt.", footer_style))

    doc.build(story)
    print(f"[OK] Generated invoice PDF: {output_path}")

def process_client_invoice(client_id):
    with engine.begin() as conn:
        client_row = conn.execute(
            text("SELECT id, name, company, email, hourly_rate, currency FROM clients WHERE id = :cid"),
            {"cid": client_id}
        ).fetchone()

        if not client_row:
            print(f"Client {client_id} not found.")
            return

        client = dict(client_row._mapping)

        entries_rows = conn.execute(
            text("SELECT id, task_name, start_time, duration_hours, raw_notes, ai_summary "
                 "FROM time_entries WHERE client_id = :cid AND status = 'Unbilled' AND is_billable = TRUE ORDER BY start_time ASC"),
            {"cid": client_id}
        ).fetchall()

        if not entries_rows:
            print(f"No unbilled hours for client {client['company']}.")
            return

        entries = [dict(r._mapping) for r in entries_rows]
        total_hours = sum(Decimal(str(e['duration_hours'])) for e in entries)
        total_amount = Decimal(str(total_hours)) * Decimal(str(client['hourly_rate']))

        for e in entries:
            if not e['ai_summary']:
                e['ai_summary'] = generate_ai_summary([e['raw_notes']])
                conn.execute(
                    text("UPDATE time_entries SET ai_summary = :summary WHERE id = :id"),
                    {"summary": e['ai_summary'], "id": e['id']}
                )

        invoice_num = f"INV-{datetime.utcnow().strftime('%Y%m')}-{str(client['id'])[:4].upper()}"
        os.makedirs("invoices", exist_ok=True)
        pdf_path = f"invoices/{invoice_num}.pdf"

        generate_invoice_pdf(client, entries, invoice_num, pdf_path, float(total_amount), float(total_hours))

        conn.execute(
            text("INSERT INTO invoices (client_id, invoice_number, total_amount, hours_total, pdf_path, status) "
                 "VALUES (:cid, :inv_num, :amt, :hrs, :path, 'Sent')"),
            {"cid": client_id, "inv_num": invoice_num, "amt": total_amount, "hrs": total_hours, "path": pdf_path}
        )

        entry_ids = [e['id'] for e in entries]
        conn.execute(
            text("UPDATE time_entries SET status = 'Invoiced' WHERE id = ANY(:ids)"),
            {"ids": entry_ids}
        )

        print(f"[DONE] Successfully invoiced {len(entries)} items for {client['company']}. Total: ${total_amount:.2f}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DevTimer Invoice Engine")
    parser.add_argument("--client-id", help="Client UUID to process")
    parser.add_argument("--all", action="store_true", help="Process all clients with unbilled entries")
    parser.add_argument("--watch", action="store_true", help="Run continuously every 60s")
    args = parser.parse_args()

    def run_all():
        with engine.begin() as conn:
            rows = conn.execute(text("SELECT DISTINCT client_id FROM time_entries WHERE status = 'Unbilled'")).fetchall()
            for r in rows:
                process_client_invoice(r[0])

    if args.client_id:
        process_client_invoice(args.client_id)
    elif args.all:
        run_all()
    elif args.watch:
        print("[*] Worker active in watch mode. Checking for invoices...")
        while True:
            try:
                run_all()
            except Exception as e:
                print(f"[ERR] Error in watch loop: {e}")
            time.sleep(60)
    else:
        run_all()
