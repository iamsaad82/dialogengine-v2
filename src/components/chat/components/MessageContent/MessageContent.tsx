import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import '../../styles/message-content.css';

interface MessageContentProps {
  content: string;
  role: 'user' | 'assistant';
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, role }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Lese zuerst den gesamten Inhalt, bevor Änderungen vorgenommen werden.
  
  // Verbesserte Verarbeitung aller speziellen Sektionen
  const enhanceSpecialSections = () => {
    if (!contentRef.current) return;
    
    // 1. Key Facts verbessern
    enhanceKeyFacts();
    
    // 2. Schnellüberblick verbessern
    enhanceQuickOverview();
    
    // 3. Tipps verbessern
    enhanceTips();
  };
  
  // Verarbeitung der Key Facts mit Icons und besserer Struktur
  const enhanceKeyFacts = () => {
    if (!contentRef.current) return;
    
    const keyFactsDiv = contentRef.current.querySelector('.keyfacts');
    if (!keyFactsDiv) return;
    
    // Aktualisiere die Überschrift, falls vorhanden oder erstelle eine
    let headingElement = keyFactsDiv.querySelector('h3, h4');
    if (!headingElement) {
      headingElement = document.createElement('h4');
      headingElement.textContent = 'Key Facts:';
      keyFactsDiv.insertBefore(headingElement, keyFactsDiv.firstChild);
    } else if (headingElement.tagName.toLowerCase() === 'h3') {
      // Konvertiere h3 zu h4 für bessere Konsistenz
      const newHeading = document.createElement('h4');
      newHeading.innerHTML = headingElement.innerHTML;
      newHeading.className = headingElement.className;
      keyFactsDiv.replaceChild(newHeading, headingElement);
      headingElement = newHeading;
    }
    
    // Stelle sicher, dass die Liste die richtige Klasse hat
    const list = keyFactsDiv.querySelector('ul');
    if (list) {
      list.classList.add('keyfacts-list');
    }
    
    // Finde alle Listenelemente in den Key Facts
    const listItems = keyFactsDiv.querySelectorAll('li');
    
    listItems.forEach(item => {
      const text = item.textContent || '';
      
      // Wenn kein Strong-Element vorhanden ist, versuche automatisch ein Icon hinzuzufügen
      if (!item.querySelector('strong')) {
        // Bestimme das passende Icon basierend auf dem Text-Inhalt
        let iconContent = '📌'; // Standard-Icon
        
        if (text.toLowerCase().includes('veranstalt')) iconContent = '🎭';
        else if (text.toLowerCase().includes('karten') || text.toLowerCase().includes('reservier')) iconContent = '🎟️';
        else if (text.toLowerCase().includes('telefon') || text.toLowerCase().includes('tel') || text.toLowerCase().includes('kontakt')) iconContent = '📞';
        else if (text.toLowerCase().includes('e-mail') || text.toLowerCase().includes('mail')) iconContent = '📧';
        else if (text.toLowerCase().includes('website') || text.toLowerCase().includes('link') || text.toLowerCase().includes('online')) iconContent = '🔗';
        else if (text.toLowerCase().includes('adresse') || text.toLowerCase().includes('standort') || text.toLowerCase().includes('ort')) iconContent = '📍';
        else if (text.toLowerCase().includes('programm') || text.toLowerCase().includes('angebot')) iconContent = '📋';
        else if (text.toLowerCase().includes('spielstätt')) iconContent = '🏛️';
        else if (text.toLowerCase().includes('uhrzeit') || text.toLowerCase().includes('öffnungszeit') || text.toLowerCase().includes('termin')) iconContent = '🕒';
        else if (text.toLowerCase().includes('preis') || text.toLowerCase().includes('kosten') || text.toLowerCase().includes('gebühr')) iconContent = '💰';
        
        // Erstelle das Strong-Element mit Icon
        const strongElement = document.createElement('strong');
        strongElement.textContent = `${iconContent} `;
        
        // Füge den Rest des Textes hinzu
        const textNode = document.createTextNode(text);
        
        // Leere das Element und füge die neuen Inhalte hinzu
        item.innerHTML = '';
        item.appendChild(strongElement);
        item.appendChild(textNode);
      }
    });
  };
  
  // Verbessere den Schnellüberblick Bereich
  const enhanceQuickOverview = () => {
    if (!contentRef.current) return;
    
    const overviewDiv = contentRef.current.querySelector('.schnellueberblick');
    if (!overviewDiv) return;
    
    // Stelle sicher, dass ein Titel vorhanden ist
    if (!overviewDiv.querySelector('h3, h4')) {
      const title = document.createElement('h4');
      title.textContent = 'Auf einen Blick:';
      title.className = 'overview-title';
      overviewDiv.insertBefore(title, overviewDiv.firstChild);
    }
  };
  
  // Verbessere den Tipp-Bereich
  const enhanceTips = () => {
    if (!contentRef.current) return;
    
    const tippDiv = contentRef.current.querySelector('.tipp');
    if (!tippDiv) return;
    
    // Stelle sicher, dass die Formatierung stimmt
    const paragraphs = tippDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      if (!p.textContent?.startsWith('💡')) {
        // Wenn das Emoji nicht bereits vorhanden ist, lass es dem CSS überlassen
        // Wir entfernen unnötige Emoji oder Präfixe
        p.innerHTML = p.innerHTML.replace(/^(💡|Tipp:|Hinweis:)\s*/i, '');
      }
    });
  };

  // Verbessere spezielle Sektionen nach dem Rendern
  useEffect(() => {
    if (role === 'assistant' && contentRef.current) {
      enhanceSpecialSections();
    }
  }, [content, role]);

  // Spezielle Vorverarbeitung für Key Facts und andere Formatierungen
  const processContent = () => {
    // Sicherheitsprüfung für leeren Inhalt
    if (content === null || content === undefined) {
      console.log("MESSAGE-DEBUG-011: Ungültiger Inhalt:", content);
      return <div className="text-red-500">Ungültige Nachricht</div>;
    }
    
    // Falls content ein leerer String ist, zeige einen leeren Container
    if (content === '') {
      return <div className="prose prose-sm break-words pointer-events-auto message-content"></div>;
    }

    // Stellen wir sicher, dass content wirklich ein String ist
    const safeContent = typeof content === 'string' ? content : String(content);

    // Prüfen, ob der Inhalt HTML ist (beginnt mit <)
    if (safeContent.trim().startsWith('<') && (safeContent.includes('</div>') || safeContent.includes('</p>'))) {
      return (
        <div 
          ref={contentRef}
          className="prose prose-sm break-words pointer-events-auto message-content"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      );
    }
    
    // Spezielle Vorverarbeitung für Key Facts
    let processedContent = safeContent;
    
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
      <div 
        className="prose prose-sm break-words pointer-events-auto message-content"
        style={{
          minHeight: role === 'assistant' ? '24px' : 'auto', // Minimale Höhe für Assistenten-Nachrichten
          transition: 'height 0.1s ease-out', // Sanfte Höhenübergänge
          overflowAnchor: 'auto', // Verbessert Scroll-Verhalten während Updates
          contain: 'content', // Reduziert Layout-Neuberechnungen
          willChange: 'contents', // Optimiert für häufige Inhaltsänderungen
        }}
      >
        <ReactMarkdown
          components={{
            a: ({node, ...props}) => {
              // Link-Klasse basierend auf dem Typ bestimmen
              let className = 'default-link';
              
              // Linktyp basierend auf href bestimmen
              if (props.href?.startsWith('tel:')) {
                className = 'phone-link';
              } else if (props.href?.startsWith('mailto:')) {
                className = 'email-link';
              } else if (props.href?.startsWith('http')) {
                className = 'web-link';
              }
              
              // Link-Handler für externe Links
              const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                if (props.href?.startsWith('http')) {
                  e.preventDefault();
                  window.open(props.href, '_blank', 'noopener,noreferrer');
                }
              };
              
              return (
                <a 
                  {...props} 
                  className={className}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClick}
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
            h4: ({node, ...props}) => <h4 {...props} />,
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
            },
            div: ({node, ...props}) => <div {...props} />
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