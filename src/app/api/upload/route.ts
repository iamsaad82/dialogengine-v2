import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
    }

    // Prüfe Dateityp (nur Bilder erlauben)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Nur Bilder sind erlaubt' }, { status: 400 });
    }

    // Prüfe Dateigröße (max. 1MB)
    if (file.size > 1024 * 1024) {
      return NextResponse.json({ error: 'Die Datei ist zu groß (max. 1MB)' }, { status: 400 });
    }

    // Eindeutigen Dateinamen generieren
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${randomUUID()}.${fileExtension}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatar');
    const filePath = join(uploadDir, fileName);
    
    // Dateipfad, den wir in der Datenbank speichern werden
    const fileUrl = `/uploads/avatar/${fileName}`;

    // Stellen sicher, dass das Verzeichnis existiert
    if (!existsSync(uploadDir)) {
      console.log(`Erstelle Verzeichnis: ${uploadDir}`);
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Datei als ArrayBuffer lesen
    const buffer = await file.arrayBuffer();
    
    // Datei speichern
    await writeFile(filePath, Buffer.from(buffer));
    console.log(`Datei erfolgreich gespeichert unter: ${filePath}`);

    // URL zurückgeben
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error('Fehler beim Upload:', error);
    return NextResponse.json({ error: `Interner Serverfehler: ${error.message}` }, { status: 500 });
  }
} 