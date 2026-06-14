import ExcelJS from 'exceljs';
import { readSubmissions } from '@/lib/appsScript';
import { SHEET_HEADERS, type SheetHeader } from '@/lib/fields';

export async function GET() {
  try {
    const submissions = await readSubmissions();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Predictions');
    sheet.addRow(SHEET_HEADERS as unknown as string[]);
    submissions.forEach((s) =>
      sheet.addRow(SHEET_HEADERS.map((key) => s[key as SheetHeader]))
    );

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="WorldCup2026_Predictions.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Error exporting submissions:', error);
    return new Response('Unable to export submissions right now.', { status: 500 });
  }
}
