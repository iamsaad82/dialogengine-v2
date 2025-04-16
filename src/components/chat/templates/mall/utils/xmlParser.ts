'use client';

import { ShopData } from '../components/ShopCard';
import { MallSection, MallSectionType } from './contentParser';
import { EventData } from '../components/FluidEventSlider';
import { ServiceData } from '../components/FluidServiceSlider';
import { OpeningHoursData } from '../components/FluidOpeningHoursCard';
import { ParkingData } from '../components/FluidParkingCard';

/**
 * Parst XML-Tags aus dem Content und erstellt strukturierte Mall-Sektionen
 */
export function parseXmlContent(content: string, query: string = ''): MallSection[] {
  if (!content) return [];

  console.log('XML-Parser: Verarbeite Content mit Länge', content.length);
  
  const mallSections: MallSection[] = [];
  
  // Intro-Sektion extrahieren
  const introMatch = content.match(/<intro>([\s\S]*?)<\/intro>/);
  if (introMatch && introMatch[1]) {
    mallSections.push({
      type: 'intro',
      title: '',
      content: introMatch[1],
      query
    });
  }
  
  // Tip-Sektion extrahieren
  const tipMatch = content.match(/<tip>([\s\S]*?)<\/tip>/);
  if (tipMatch && tipMatch[1]) {
    mallSections.push({
      type: 'tip',
      title: '',
      content: tipMatch[1],
      query
    });
  }
  
  // Shops-Sektion extrahieren
  const shopsMatch = content.match(/<shops([^>]*)>([\s\S]*?)<\/shops>/);
  if (shopsMatch) {
    const shopsContent = shopsMatch[2];
    const titleMatch = shopsMatch[1].match(/title="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : 'Shops im Center';
    
    const shops = extractShopsFromXml(shopsContent);
    
    if (shops.length > 0) {
      mallSections.push({
        type: 'shops',
        title,
        items: shops,
        query
      });
    }
  }
  
  // Restaurants-Sektion extrahieren
  const restaurantsMatch = content.match(/<restaurants([^>]*)>([\s\S]*?)<\/restaurants>/);
  if (restaurantsMatch) {
    const restaurantsContent = restaurantsMatch[2];
    const titleMatch = restaurantsMatch[1].match(/title="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : 'Restaurants im Center';
    
    const restaurants = extractRestaurantsFromXml(restaurantsContent);
    
    if (restaurants.length > 0) {
      mallSections.push({
        type: 'restaurants',
        title,
        items: restaurants,
        query
      });
    }
  }
  
  // Öffnungszeiten-Sektion extrahieren
  const openingHoursMatch = content.match(/<openingHours([^>]*)>([\s\S]*?)<\/openingHours>/);
  if (openingHoursMatch) {
    const openingHoursContent = openingHoursMatch[2];
    const titleMatch = openingHoursMatch[1].match(/title="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : 'Öffnungszeiten';
    
    const openingHoursData = extractOpeningHoursFromXml(openingHoursContent);
    
    mallSections.push({
      type: 'openingHours',
      title,
      data: openingHoursData,
      content: formatOpeningHoursAsHtml(openingHoursData),
      query
    });
  }
  
  // Events-Sektion extrahieren
  const eventsMatch = content.match(/<events([^>]*)>([\s\S]*?)<\/events>/);
  if (eventsMatch) {
    const eventsContent = eventsMatch[2];
    const titleMatch = eventsMatch[1].match(/title="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : 'Events im Center';
    
    const events = extractEventsFromXml(eventsContent);
    
    if (events.length > 0) {
      mallSections.push({
        type: 'events',
        title,
        items: events,
        query
      });
    }
  }
  
  // Services-Sektion extrahieren
  const servicesMatch = content.match(/<services([^>]*)>([\s\S]*?)<\/services>/);
  if (servicesMatch) {
    const servicesContent = servicesMatch[2];
    const titleMatch = servicesMatch[1].match(/title="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : 'Services im Center';
    
    const services = extractServicesFromXml(servicesContent);
    
    if (services.length > 0) {
      mallSections.push({
        type: 'services',
        title,
        items: services,
        query
      });
    }
  }
  
  // Parking-Sektion extrahieren
  const parkingMatch = content.match(/<parking([^>]*)>([\s\S]*?)<\/parking>/);
  if (parkingMatch) {
    const parkingContent = parkingMatch[2];
    const titleMatch = parkingMatch[1].match(/title="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : 'Parkgebühren';
    
    const parkingData = extractParkingFromXml(parkingContent);
    
    mallSections.push({
      type: 'parking',
      title,
      data: parkingData,
      content: formatParkingAsHtml(parkingData),
      query
    });
  }
  
  // FollowUp-Sektion extrahieren
  const followUpMatch = content.match(/<followUp>([\s\S]*?)<\/followUp>/);
  if (followUpMatch && followUpMatch[1]) {
    mallSections.push({
      type: 'followUp',
      title: 'Weitere Fragen',
      content: followUpMatch[1],
      query
    });
  }
  
  console.log('XML-Parser: Extrahierte Sektionen:', mallSections.map(s => s.type));

  // Debug-Ausgabe für Shops
  const shopsSection = mallSections.find(s => s.type === 'shops');
  if (shopsSection && shopsSection.items) {
    console.log('XML-Parser: Gefundene Shops:', shopsSection.items.length, shopsSection.items);
  }
  return mallSections;
}

/**
 * Extrahiert Shop-Daten aus XML-Tags
 */
function extractShopsFromXml(content: string): ShopData[] {
  if (!content) return [];
  
  const shops: ShopData[] = [];
  const shopMatches = content.match(/<shop>([\s\S]*?)<\/shop>/g) || [];
  
  console.log('XML-Parser: Anzahl Shop-Matches:', shopMatches.length);
  
  shopMatches.forEach((shopMatch, index) => {
    try {
      // Verbesserte Suche nach Name-Tags mit allen möglichen Varianten
      const nameMatch = shopMatch.match(/<name>([\s\S]*?)<\/name>/) || 
                       shopMatch.match(/<n>([\s\S]*?)<\/n>/) || 
                       shopMatch.match(/<name>([\s\S]*?)<\/n>/) || 
                       shopMatch.match(/<n>([\s\S]*?)<\/name>/);
                       
      // Fallback: Suche nach Namen ohne Tags (für beschädigte XML)
      const nameFallbackMatch = !nameMatch && shopMatch.includes('name') ? 
                              shopMatch.match(/name[^>]*>([^<]+)/) : null;
      
      const categoryMatch = shopMatch.match(/<category>([\s\S]*?)<\/category>/);
      const floorMatch = shopMatch.match(/<floor>([\s\S]*?)<\/floor>/);
      const imageMatch = shopMatch.match(/<image>([\s\S]*?)<\/image>/);
      const descriptionMatch = shopMatch.match(/<description>([\s\S]*?)<\/description>/);
      const openingMatch = shopMatch.match(/<opening>([\s\S]*?)<\/opening>/);
      const linkMatch = shopMatch.match(/<link>([\s\S]*?)<\/link>/);
      
      // Effektiver Name aus regulärem Match oder Fallback
      const effectiveName = nameMatch ? nameMatch[1] : (nameFallbackMatch ? nameFallbackMatch[1] : null);
      
      // Debug-Ausgabe für jeden Shop
      console.log(`XML-Parser: Shop ${index + 1}:`, 
        effectiveName || 'Kein Name',
        categoryMatch ? categoryMatch[1] : 'Keine Kategorie',
        imageMatch ? 'Mit Bild' : 'Ohne Bild');
      
      if (effectiveName) {
        shops.push({
          name: effectiveName,
          category: categoryMatch ? categoryMatch[1] : undefined,
          floor: floorMatch ? floorMatch[1] : undefined,
          image: imageMatch ? imageMatch[1] : undefined,
          description: descriptionMatch ? descriptionMatch[1] : undefined,
          opening: openingMatch ? openingMatch[1] : undefined,
          link: linkMatch ? linkMatch[1] : undefined
        });
      } else {
        console.warn('XML-Parser: Shop ohne Namen gefunden:', shopMatch);
      }
    } catch (error) {
      console.error('XML-Parser: Fehler beim Parsen eines Shops:', error);
    }
  });
  
  console.log('XML-Parser: Extrahierte Shops:', shops.length);
  return shops;
}

/**
 * Extrahiert Restaurant-Daten aus XML-Tags
 */
function extractRestaurantsFromXml(content: string): ShopData[] {
  if (!content) return [];
  
  const restaurants: ShopData[] = [];
  const restaurantMatches = content.match(/<restaurant>([\s\S]*?)<\/restaurant>/g) || [];
  
  console.log('XML-Parser: Anzahl Restaurant-Matches:', restaurantMatches.length);
  
  restaurantMatches.forEach((restaurantMatch, index) => {
    try {
      // Verbesserte Suche nach Name-Tags mit allen möglichen Varianten
      const nameMatch = restaurantMatch.match(/<name>([\s\S]*?)<\/name>/) || 
                       restaurantMatch.match(/<n>([\s\S]*?)<\/n>/) || 
                       restaurantMatch.match(/<name>([\s\S]*?)<\/n>/) || 
                       restaurantMatch.match(/<n>([\s\S]*?)<\/name>/);
                       
      // Fallback: Suche nach Namen ohne Tags (für beschädigte XML)
      const nameFallbackMatch = !nameMatch && restaurantMatch.includes('name') ? 
                              restaurantMatch.match(/name[^>]*>([^<]+)/) : null;
      
      const categoryMatch = restaurantMatch.match(/<category>([\s\S]*?)<\/category>/);
      const floorMatch = restaurantMatch.match(/<floor>([\s\S]*?)<\/floor>/);
      const imageMatch = restaurantMatch.match(/<image>([\s\S]*?)<\/image>/);
      const descriptionMatch = restaurantMatch.match(/<description>([\s\S]*?)<\/description>/);
      const openingMatch = restaurantMatch.match(/<opening>([\s\S]*?)<\/opening>/);
      const linkMatch = restaurantMatch.match(/<link>([\s\S]*?)<\/link>/);
      
      // Effektiver Name aus regulärem Match oder Fallback
      const effectiveName = nameMatch ? nameMatch[1] : (nameFallbackMatch ? nameFallbackMatch[1] : null);
      
      // Debug-Ausgabe für jedes Restaurant
      console.log(`XML-Parser: Restaurant ${index + 1}:`, 
        effectiveName || 'Kein Name',
        categoryMatch ? categoryMatch[1] : 'Keine Kategorie',
        imageMatch ? 'Mit Bild' : 'Ohne Bild');
      
      if (effectiveName) {
        restaurants.push({
          name: effectiveName,
          category: categoryMatch ? categoryMatch[1] : undefined,
          floor: floorMatch ? floorMatch[1] : undefined,
          image: imageMatch ? imageMatch[1] : undefined,
          description: descriptionMatch ? descriptionMatch[1] : undefined,
          opening: openingMatch ? openingMatch[1] : undefined,
          link: linkMatch ? linkMatch[1] : undefined
        });
      } else {
        console.warn('XML-Parser: Restaurant ohne Namen gefunden:', restaurantMatch);
      }
    } catch (error) {
      console.error('XML-Parser: Fehler beim Parsen eines Restaurants:', error);
    }
  });
  
  console.log('XML-Parser: Extrahierte Restaurants:', restaurants.length);
  return restaurants;
}

/**
 * Extrahiert Service-Daten aus XML-Tags
 */
function extractServicesFromXml(content: string): ServiceData[] {
  if (!content) return [];
  
  const services: ServiceData[] = [];
  const serviceMatches = content.match(/<service>([\s\S]*?)<\/service>/g) || [];
  
  serviceMatches.forEach(serviceMatch => {
    try {
      // Verbesserte Suche nach Name-Tags mit allen möglichen Varianten
      const nameMatch = serviceMatch.match(/<name>([\s\S]*?)<\/name>/) || 
                       serviceMatch.match(/<n>([\s\S]*?)<\/n>/) || 
                       serviceMatch.match(/<name>([\s\S]*?)<\/n>/) || 
                       serviceMatch.match(/<n>([\s\S]*?)<\/name>/);
                       
      // Fallback: Suche nach Namen ohne Tags (für beschädigte XML)
      const nameFallbackMatch = !nameMatch && serviceMatch.includes('name') ? 
                              serviceMatch.match(/name[^>]*>([^<]+)/) : null;
      
      const categoryMatch = serviceMatch.match(/<category>([\s\S]*?)<\/category>/);
      const locationMatch = serviceMatch.match(/<location>([\s\S]*?)<\/location>/);
      const imageMatch = serviceMatch.match(/<image>([\s\S]*?)<\/image>/);
      const descriptionMatch = serviceMatch.match(/<description>([\s\S]*?)<\/description>/);
      const hoursMatch = serviceMatch.match(/<hours>([\s\S]*?)<\/hours>/);
      const linkMatch = serviceMatch.match(/<link>([\s\S]*?)<\/link>/);
      
      // Effektiver Name aus regulärem Match oder Fallback
      const effectiveName = nameMatch ? nameMatch[1] : (nameFallbackMatch ? nameFallbackMatch[1] : null);
      
      if (effectiveName) {
        services.push({
          name: effectiveName,
          category: categoryMatch ? categoryMatch[1] : undefined,
          location: locationMatch ? locationMatch[1] : undefined,
          image: imageMatch ? imageMatch[1] : undefined,
          description: descriptionMatch ? descriptionMatch[1] : undefined,
          // Verwende 'opening' statt 'hours' für Konsistenz mit dem ServiceData-Interface
          opening: hoursMatch ? hoursMatch[1] : undefined,
          link: linkMatch ? linkMatch[1] : undefined
        } as ServiceData);
      }
    } catch (error) {
      console.error('XML-Parser: Fehler beim Parsen eines Services:', error);
    }
  });
  
  return services;
}

/**
 * Extrahiert Öffnungszeiten-Daten aus XML-Tags
 */
function extractOpeningHoursFromXml(content: string): OpeningHoursData {
  if (!content) return { regularHours: [] };
  
  const regularHours: { day: string; hours: string }[] = [];
  const specialHours: { date: string; hours: string }[] = [];
  const notes: string[] = [];
  
  try {
    // Reguläre Öffnungszeiten extrahieren
    const regularMatches = content.match(/<regular>([\s\S]*?)<\/regular>/g) || [];
    regularMatches.forEach(regularMatch => {
      const dayMatch = regularMatch.match(/<day>([\s\S]*?)<\/day>/);
      const hoursMatch = regularMatch.match(/<hours>([\s\S]*?)<\/hours>/);
      
      if (dayMatch && hoursMatch) {
        regularHours.push({
          day: dayMatch[1],
          hours: hoursMatch[1]
        });
      }
    });
    
    // Spezielle Öffnungszeiten extrahieren
    const specialMatches = content.match(/<special>([\s\S]*?)<\/special>/g) || [];
    specialMatches.forEach(specialMatch => {
      const dateMatch = specialMatch.match(/<date>([\s\S]*?)<\/date>/);
      const hoursMatch = specialMatch.match(/<hours>([\s\S]*?)<\/hours>/);
      
      if (dateMatch && hoursMatch) {
        specialHours.push({
          date: dateMatch[1],
          hours: hoursMatch[1]
        });
      }
    });
    
    // Hinweise extrahieren
    const noteMatches = content.match(/<note>([\s\S]*?)<\/note>/g) || [];
    noteMatches.forEach(noteMatch => {
      const noteContent = noteMatch.match(/<note>([\s\S]*?)<\/note>/);
      if (noteContent) {
        notes.push(noteContent[1]);
      }
    });
  } catch (error) {
    console.error('XML-Parser: Fehler beim Parsen der Öffnungszeiten:', error);
  }
  
  return {
    regularHours,
    specialHours: specialHours.length > 0 ? specialHours : undefined,
    notes: notes.length > 0 ? notes : undefined
  };
}

/**
 * Formatiert Öffnungszeiten als HTML
 */
function formatOpeningHoursAsHtml(data: OpeningHoursData): string {
  if (!data || !data.regularHours || data.regularHours.length === 0) return '';
  
  let html = '<div class="opening-hours">';
  
  html += '<h4>Reguläre Öffnungszeiten</h4><ul>';
  data.regularHours.forEach((item: { day: string; hours: string }) => {
    html += `<li><strong>${item.day}:</strong> ${item.hours}</li>`;
  });
  html += '</ul>';
  
  if (data.specialHours && data.specialHours.length > 0) {
    html += '<h4>Sonderöffnungszeiten</h4><ul>';
    data.specialHours.forEach((item: { date: string; hours: string }) => {
      html += `<li><strong>${item.date}:</strong> ${item.hours}</li>`;
    });
    html += '</ul>';
  }
  
  if (data.notes && data.notes.length > 0) {
    html += '<h4>Hinweise</h4><ul>';
    data.notes.forEach((note: string) => {
      html += `<li>${note}</li>`;
    });
    html += '</ul>';
  }
  
  html += '</div>';
  return html;
}

/**
 * Extrahiert Event-Daten aus XML-Tags
 */
function extractEventsFromXml(content: string): EventData[] {
  if (!content) return [];
  
  const events: EventData[] = [];
  const eventMatches = content.match(/<event>([\s\S]*?)<\/event>/g) || [];
  
  eventMatches.forEach(eventMatch => {
    try {
      // Verbesserte Suche nach Name-Tags mit allen möglichen Varianten
      const nameMatch = eventMatch.match(/<name>([\s\S]*?)<\/name>/) || 
                       eventMatch.match(/<n>([\s\S]*?)<\/n>/) || 
                       eventMatch.match(/<name>([\s\S]*?)<\/n>/) || 
                       eventMatch.match(/<n>([\s\S]*?)<\/name>/);
                       
      // Fallback: Suche nach Namen ohne Tags (für beschädigte XML)
      const nameFallbackMatch = !nameMatch && eventMatch.includes('name') ? 
                              eventMatch.match(/name[^>]*>([^<]+)/) : null;
      
      const dateMatch = eventMatch.match(/<date>([\s\S]*?)<\/date>/);
      const timeMatch = eventMatch.match(/<time>([\s\S]*?)<\/time>/);
      const locationMatch = eventMatch.match(/<location>([\s\S]*?)<\/location>/);
      const imageMatch = eventMatch.match(/<image>([\s\S]*?)<\/image>/);
      const descriptionMatch = eventMatch.match(/<description>([\s\S]*?)<\/description>/);
      const linkMatch = eventMatch.match(/<link>([\s\S]*?)<\/link>/);
      
      // Effektiver Name aus regulärem Match oder Fallback
      const effectiveName = nameMatch ? nameMatch[1] : (nameFallbackMatch ? nameFallbackMatch[1] : null);
      
      if (effectiveName) {
        events.push({
          // Verwende 'title' statt 'name' für Konsistenz mit dem EventData-Interface
          title: effectiveName,
          date: dateMatch ? dateMatch[1] : '',
          time: timeMatch ? timeMatch[1] : undefined,
          location: locationMatch ? locationMatch[1] : undefined,
          image: imageMatch ? imageMatch[1] : undefined,
          description: descriptionMatch ? descriptionMatch[1] : undefined,
          link: linkMatch ? linkMatch[1] : undefined
        } as EventData);
      }
    } catch (error) {
      console.error('XML-Parser: Fehler beim Parsen eines Events:', error);
    }
  });
  
  return events;
}

/**
 * Extrahiert Parkgebühren-Daten aus XML-Tags
 */
function extractParkingFromXml(content: string): ParkingData {
  if (!content) return { fees: [] };
  
  const fees: { duration: string; price: string }[] = [];
  const notes: string[] = [];
  
  try {
    // Parkgebühren extrahieren
    const feeMatches = content.match(/<fee>([\s\S]*?)<\/fee>/g) || [];
    feeMatches.forEach(feeMatch => {
      const durationMatch = feeMatch.match(/<duration>([\s\S]*?)<\/duration>/);
      const priceMatch = feeMatch.match(/<price>([\s\S]*?)<\/price>/);
      
      if (durationMatch && priceMatch) {
        fees.push({
          duration: durationMatch[1],
          price: priceMatch[1]
        });
      }
    });
    
    // Hinweise extrahieren
    const noteMatches = content.match(/<note>([\s\S]*?)<\/note>/g) || [];
    noteMatches.forEach(noteMatch => {
      const noteContent = noteMatch.match(/<note>([\s\S]*?)<\/note>/);
      if (noteContent) {
        notes.push(noteContent[1]);
      }
    });
  } catch (error) {
    console.error('XML-Parser: Fehler beim Parsen der Parkgebühren:', error);
  }
  
  return {
    fees,
    notes: notes.length > 0 ? notes : undefined
  };
}

/**
 * Formatiert Parkgebühren als HTML
 */
function formatParkingAsHtml(data: any): string {
  if (!data) return '';
  
  let html = '<div class="parking-fees">';
  
  if (data.fees && data.fees.length > 0) {
    html += '<h4>Parkgebühren</h4><ul>';
    data.fees.forEach((item: { duration: string; price: string }) => {
      html += `<li><strong>${item.duration}:</strong> ${item.price}</li>`;
    });
    html += '</ul>';
  }
  
  if (data.notes && data.notes.length > 0) {
    html += '<h4>Hinweise</h4><ul>';
    data.notes.forEach((note: string) => {
      html += `<li>${note}</li>`;
    });
    html += '</ul>';
  }
  
  html += '</div>';
  return html;
}
