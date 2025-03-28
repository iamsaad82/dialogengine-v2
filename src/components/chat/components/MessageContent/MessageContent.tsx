import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import '../../styles/message-content.css';

interface MessageContentProps {
  content: string;
  role: 'user' | 'assistant';
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, role }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Verarbeitung der Key Facts mit Icons und besserer Struktur
  const enhanceKeyFacts = () => {
    if (!contentRef.current) return;
    
    const keyFactsDiv = contentRef.current.querySelector('.keyfacts');
    if (!keyFactsDiv) return;
    
    // Finde alle Listenelemente in den Key Facts
    const listItems = keyFactsDiv.querySelectorAll('li');
    
    listItems.forEach(item => {
      const text = item.textContent || '';
      
      // Bestimme das passende Icon basierend auf dem Text-Inhalt
      let iconContent = '📌'; // Standard-Icon
      
      if (text.includes('Veranstalter')) iconContent = '🎭';
      else if (text.includes('Kartenreservierung')) iconContent = '🎟️';
      else if (text.includes('Telefon') || text.includes('Tel')) iconContent = '📞';
      else if (text.includes('E-Mail')) iconContent = '📧';
      else if (text.includes('Website') || text.includes('Link')) iconContent = '🔗';
      else if (text.includes('Adresse') || text.includes('Standort')) iconContent = '📍';
      else if (text.includes('Programm')) iconContent = '📋';
      else if (text.includes('Hauptspielstätten')) iconContent = '🏛️';
      else if (text.includes('Uhrzeit') || text.includes('Öffnungszeiten')) iconContent = '🕒';
      else if (text.includes('Preis') || text.includes('Kosten')) iconContent = '💰';
      
      // Erstelle das Icon-Element
      const iconDiv = document.createElement('div');
      iconDiv.className = 'fact-icon';
      iconDiv.textContent = iconContent;
      
      // Erstelle das Content-Div für den Text
      const contentDiv = document.createElement('div');
      contentDiv.className = 'fact-content';
      
      // Verschiebe den Inhalt in das Content-Div
      contentDiv.innerHTML = item.innerHTML;
      
      // Leere das ursprüngliche Element und füge Icon + Inhalt hinzu
      item.innerHTML = '';
      item.appendChild(iconDiv);
      item.appendChild(contentDiv);
      
      // Füge bei Links einen kleinen Hover-Effekt hinzu
      const links = contentDiv.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('mouseover', () => {
          link.style.transform = 'translateY(-1px)';
        });
        link.addEventListener('mouseout', () => {
          link.style.transform = 'translateY(0)';
        });
      });
    });
    
    // Füge einen Titel hinzu, falls nicht vorhanden
    if (!keyFactsDiv.querySelector('h3')) {
      const title = document.createElement('h3');
      title.textContent = 'Key Facts';
      keyFactsDiv.insertBefore(title, keyFactsDiv.firstChild);
    }
  };

  // Verbessere Key Facts nach dem Rendern
  useEffect(() => {
    if (role === 'assistant' && contentRef.current) {
      enhanceKeyFacts();
    }
  }, [content, role]);

  // Spezielle Vorverarbeitung für Key Facts und andere Formatierungen
  const processContent = () => {
    // Sicherheitsprüfung für leeren Inhalt
    if (!content || typeof content !== 'string') {
      console.log("MESSAGE-DEBUG-011: Ungültiger Inhalt:", content);
      return <div className="text-red-500">Ungültige Nachricht</div>;
    }
    
    // Spezielle Vorverarbeitung für Key Facts
    let processedContent = content;
    
    // 1. Spezielle Ersetzung für bekannte Key Facts-Strukturen
    
    // [Erlebnis Brandenburg [Unterkünfte](https://erlebnis-brandenburg.de/uebernachten)) zu korrigieren
    // -> Erlebnis Brandenburg: [Unterkünfte](https://erlebnis-brandenburg.de/uebernachten)
    processedContent = processedContent.replace(/\[([^[\]]+) \[([^[\]]+)]\(([^()]+)\)]/g, (match, prefix, text, url) => {
      return `${prefix}: [${text}](${url})`;
    });
    
    // Spezielle Ersetzung für Telefonnummern im Format [[012345] 67 89 [00]](tel:+....)
    processedContent = processedContent.replace(/\[\[([^[\]]+)] ([^[\]]+) \[([^[\]]+)]]\(([^()]+)\)/g, (match, part1, part2, part3, url) => {
      return `[${part1} ${part2} ${part3}](${url})`;
    });
    
    // Allgemeinere Ersetzung für verschachtelte eckige Klammern (z.B. bei E-Mail-Adressen)
    processedContent = processedContent.replace(/\[\[([^[\]]+)](\.[^[\]]+)]/g, (match, email, domain) => {
      return `[${email}${domain}]`;
    });
    
    // Allgemeine Korrektur für falsch formatierte Linkstruktur mit fehlenden eckigen Klammern
    processedContent = processedContent.replace(/(\w+)]\(([^()]+)\)/g, (match, text, url) => {
      // Nur ersetzen, wenn nicht bereits korrekt formatiert
      if (!/\[.*\]/.test(match)) {
        return `[${text}](${url})`;
      }
      return match;
    });
    
    // 2. Spezielle Behandlung für bestimmte Schlüsselwörter in Key Facts
    
    // a. 🔗 Unterkunftssuche: (https://erlebnis-brandenburg.de/uebernachten)
    processedContent = processedContent.replace(/(🔗\s*Unterkunftssuche:)\s*\(([^()]+)\)/g, 
      (match, label, url) => `${label} [zur Unterkunftssuche](${url})`);
    
    // b. 📞 Touristinformation: [(03381) 58 80 [00]](tel:+4933815800)
    processedContent = processedContent.replace(/(📞\s*Touristinformation:)\s*\[\[([^[\]]+)] ([^[\]]+) \[([^[\]]+)]]\(([^()]+)\)/g, 
      (match, label, part1, part2, part3, url) => `${label} [${part1} ${part2} ${part3}](${url})`);
      
    // c. 📧 E-Mail: [[tourismus@stadt-brandenburg.de]](mailto:tourismus@stadt-brandenburg.de)
    processedContent = processedContent.replace(/(📧\s*E-Mail:)\s*\[\[([^[\]]+)]]\(([^()]+)\)/g, 
      (match, label, email, url) => `${label} [${email}](${url})`);
    
    // 3. Allgemeine Linkformatierungen
    
    // Konvertiere Telefonnummern, wenn nicht bereits Links
    processedContent = processedContent.replace(/(\(?\d{3,5}\)?\s*[-\s]?\d+[\s\d-]*\d+)/g, (match) => {
      // Überspringe, wenn bereits ein Link
      if (match.includes('[') || match.includes('](') || match.startsWith('tel:')) return match;
      
      // Telefonnummer bereinigen: Nur Zahlen behalten
      const cleanNumber = match.replace(/\D/g, '');
      return `[${match}](tel:+${cleanNumber})`;
    });
    
    // Konvertiere E-Mail-Adressen in Links
    processedContent = processedContent.replace(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, (match) => {
      // Überspringe, wenn bereits ein Link
      if (match.includes('[') || match.includes('](') || match.startsWith('mailto:')) return match;
      
      return `[${match}](mailto:${match})`;
    });
    
    // Konvertiere Web-URLs in Links
    processedContent = processedContent.replace(/\b(https?:\/\/[^\s]+|www\.[^\s]+\.[a-z]{2,}[^\s]*)\b/g, (match) => {
      // Überspringe, wenn bereits ein Link
      if (match.includes('[') || match.includes('](')) return match;
      
      // Füge http:// hinzu, wenn es mit www. beginnt
      const url = match.startsWith('www.') ? `https://${match}` : match;
      return `[${match}](${url})`;
    });
    
    // Korrektur für Tipps und abschließende Formatierung
    processedContent = processedContent.replace(/Tipp: (.+?)]\(([^)]+)\)/g, (match, text, url) => {
      if (!text.includes('[')) {
        return `Tipp: [${text}](${url})`;
      }
      return match;
    });
    
    return (
      <div className="prose prose-sm break-words pointer-events-auto message-content">
        <ReactMarkdown
          components={{
            a: ({node, ...props}) => {
              let className = '';
              
              // Linktyp basierend auf href bestimmen
              if (props.href?.startsWith('tel:')) {
                className = 'phone-link';
              } else if (props.href?.startsWith('mailto:')) {
                className = 'email-link';
              } else if (props.href?.startsWith('http')) {
                className = 'web-link';
              }
              
              return (
                <a 
                  {...props} 
                  className={className}
                  target={props.href?.startsWith('http') ? '_blank' : undefined}
                  rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                />
              );
            },
            ul: ({node, ...props}) => <ul {...props} />,
            li: ({node, children, ...props}) => {
              // Text des Listenelements
              const content = String(children);
              
              // Prüfe, ob es mit einer Zahl mit Punkt beginnt (z.B. "1. Kita")
              const isNumbered = /^\d+\./.test(content);
              
              // Prüfe, ob es sich um ein Key Facts Element handelt
              const isKeyFactItem = content.includes('📝 Empfehlung:') || 
                                   content.includes('📍 Standort:') || 
                                   content.includes('🔗 Unterkunftssuche:') ||
                                   content.includes('🔗 Weitere Infos:') ||
                                   content.includes('📞 Touristinformation:') ||
                                   content.includes('📧 E-Mail:') ||
                                   content.includes('📞 Touristische Beratung:');
              
              return (
                <li 
                  className={`${isNumbered ? 'numbered-item' : ''} ${isKeyFactItem ? 'key-fact-item' : ''}`}
                  {...props}
                >
                  {children}
                </li>
              );
            },
            h2: ({node, ...props}) => <h2 {...props} />,
            h3: ({node, ...props}) => <h3 {...props} />,
            p: ({node, children, ...props}) => {
              // Prüfen auf Kontaktinformationen oder Key Facts
              const content = String(children);
              const isContactInfo = /^(Adresse|Telefon|E-Mail|Standort|Öffnungszeiten|Angebote|Schulform|Schulleitung|Ganztagsschule|Kontakt|Website)/.test(content);
              const isKeyFact = content === 'Key Facts:' || content.includes('Key Facts');
              const isTipp = content.startsWith('Tipp:') || content.includes('Tipp:');
              
              if (isKeyFact) {
                return (
                  <p {...props} className="key-facts-heading">
                    {children}
                  </p>
                );
              }
              
              if (isTipp) {
                return (
                  <p {...props} className="tipp-paragraph">
                    {children}
                  </p>
                );
              }
              
              if (isContactInfo) {
                // Extrahiere Labeltext (bis zum Doppelpunkt)
                const labelMatch = content.match(/^([^:]+):/);
                if (labelMatch) {
                  const label = labelMatch[1];
                  const restContent = content.replace(/^[^:]+:/, '').trim();
                  
                  return (
                    <p {...props}>
                      <span className="contact-label">{label}:</span>{restContent}
                    </p>
                  );
                }
              }
              
              return <p {...props}>{children}</p>;
            }
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div ref={contentRef}>
      {processContent()}
    </div>
  );
};

export default MessageContent; 