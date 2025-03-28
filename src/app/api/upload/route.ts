import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

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
    const filePath = join(process.cwd(), 'public', 'uploads', 'avatar', fileName);
    
    // Dateipfad, den wir in der Datenbank speichern werden
    const fileUrl = `/uploads/avatar/${fileName}`;

    // Datei als ArrayBuffer lesen
    const buffer = await file.arrayBuffer();
    
    // Datei speichern
    await writeFile(filePath, Buffer.from(buffer));

    // URL zurückgeben
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Fehler beim Upload:', error);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
} 