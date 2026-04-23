import * as XLSX from "xlsx";
import fs from "fs";

export interface ExcelStudentData {
  email: string;
  name: string;
  rollNumber?: string;
  mentorEmail?: string;
  mentorName?: string;
}

export interface ExcelParseResult {
  students: ExcelStudentData[];
  errors: string[];
  summary: {
    totalRows: number;
    validStudents: number;
    studentsWithMentors: number;
    studentsWithoutMentors: number;
  };
}

export function parseExcelFile(filePath: string): ExcelParseResult {
  try {
    // Read the Excel file - no specific options needed to read all sheets
    const workbook = XLSX.readFile(filePath);
    const students: ExcelStudentData[] = [];
    const errors: string[] = [];
    let totalRowsProcessed = 0;

    console.log(`📂 Found ${workbook.SheetNames.length} sheets in workbook:`, workbook.SheetNames);

    // Filter out common metadata/hidden sheets if any
    const validSheetNames = workbook.SheetNames.filter(name => !name.toLowerCase().includes('sheet') || workbook.SheetNames.length <= 4);

    // 🔥 PROCESS ALL SHEETS
    for (const sheetName of validSheetNames) {
      console.log(`\n📄 Processing Sheet: "${sheetName}"`);
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to a raw 2D array first to find the header row
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (rawData.length === 0) {
        console.log(`⚠️ Skipping empty sheet: ${sheetName}`);
        continue;
      }
      
      // Column mappings (lowercase, includes common variations)
      const columnMappings = {
        name: ['name of the student', 'student name', 'name', 'full name', 'candidate name'],
        rollNumber: ['h.t.no.', 'htno', 'ht.no', 'roll no', 'roll number', 'rollno', 'reg no'],
        mentorEmail: ['mentor email', 'mentor_email', 'mentoremail', 'faculty email', 'mentor mail'],
        mentorName: ['mentor name', 'mentor_name', 'mentorname', 'faculty name', 'mentor']
      };

      // 🔍 FIND HEADER ROW (search first 10 rows)
      let headerRowIndex = -1;
      let colIndices: { [key: string]: number } = {};

      for (let r = 0; r < Math.min(rawData.length, 10); r++) {
        const row = rawData[r];
        if (!row || !Array.isArray(row)) continue;

        const normalizedRow = row.map(cell => String(cell || '').toLowerCase().trim());
        const tempIndices: { [key: string]: number } = {};
        let matchCount = 0;

        for (const [key, searchTerms] of Object.entries(columnMappings)) {
          const idx = normalizedRow.findIndex(cell => searchTerms.includes(cell) || searchTerms.some(term => cell.includes(term)));
          if (idx !== -1) {
            tempIndices[key] = idx;
            if (key === 'name' || key === 'rollNumber') matchCount++;
          }
        }

        if (matchCount >= 2) { // Found at least Name and Roll No
          headerRowIndex = r;
          colIndices = tempIndices;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.log(`❌ Could not find valid headers in sheet: ${sheetName}`);
        errors.push(`Sheet "${sheetName}": Missing required columns (Name/Roll No)`);
        continue;
      }

      let countInSheet = 0;
      // Process data rows starting after header
      for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || !row[colIndices.name]) continue;

        totalRowsProcessed++;
        try {
          const name = String(row[colIndices.name]).trim();
          const roll = colIndices.rollNumber !== undefined ? String(row[colIndices.rollNumber]).trim() : '';
          
          if (!name || !roll) continue;

          // Generate student email from roll
          const cleanRoll = roll.toLowerCase().replace(/[^a-z0-9]/g, '');
          const studentEmail = `${cleanRoll}@vnrvjiet.in`;

          students.push({
            name,
            email: studentEmail,
            rollNumber: roll,
            mentorEmail: colIndices.mentorEmail !== undefined ? String(row[colIndices.mentorEmail] || '').trim().toLowerCase() : '',
            mentorName: colIndices.mentorName !== undefined ? String(row[colIndices.mentorName] || '').trim() : ''
          });
          countInSheet++;
        } catch (err) {
          errors.push(`Sheet ${sheetName}, Row ${i + 1}: ${err}`);
        }
      }
      console.log(`✅ Extracted ${countInSheet} students from ${sheetName}`);
    }

    const studentsWithMentors = students.filter(s => s.mentorEmail).length;
    console.log(`\n🎉 DONE! Total Students extracted: ${students.length}`);

    return {
      students,
      errors,
      summary: {
        totalRows: totalRowsProcessed,
        validStudents: students.length,
        studentsWithMentors,
        studentsWithoutMentors: students.length - studentsWithMentors
      }
    };
  } catch (error) {
    throw new Error(`❌ Parse error: ${error}`);
  }
}

export function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ File deleted:", filePath);
    }
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}