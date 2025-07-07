import { Inspection } from "@shared/schema";
import jsPDF from "jspdf";

export async function generatePDF(inspection: Inspection): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Use standard font for English text
  doc.setFont("helvetica");
  
  let yPosition = 20;
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    doc.setFontSize(options.fontSize || 12);
    if (options.bold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }
    doc.text(text, x, y, { align: options.align || 'left', ...options });
  };

  // Helper function to add centered text
  const addCenteredText = (text: string, y: number, options: any = {}) => {
    addText(text, pageWidth / 2, y, { align: 'center', ...options });
  };

  // Header - "B'Ezrat Hashem"
  addCenteredText("B'Ezrat Hashem", yPosition, { fontSize: 14, bold: true });
  yPosition += 15;

  // Title
  addCenteredText("Initial Factory Inspection Report", yPosition, { fontSize: 16, bold: true });
  yPosition += 8;
  addCenteredText("For Internal Use Only - Do Not Forward!", yPosition, { fontSize: 10 });
  yPosition += 15;

  // Factory and Inspector Information
  addText(`Initial inspection at factory: ${inspection.factoryName}`, margin, yPosition, { fontSize: 12, bold: true });
  yPosition += 8;
  addText(`Inspector name: ${inspection.inspector}`, margin, yPosition, { fontSize: 12, bold: true });
  yPosition += 15;

  // Dates
  addText("Date Information:", margin, yPosition, { fontSize: 12, bold: true });
  yPosition += 8;
  const hebrewDate = inspection.hebrewDate || '';
  const gregorianDate = inspection.gregorianDate || '';
  addText(`Hebrew Date: ${hebrewDate}`, margin, yPosition);
  yPosition += 6;
  addText(`Gregorian Date: ${gregorianDate}`, margin, yPosition);
  yPosition += 15;

  // Factory Address
  addText("Factory Address:", margin, yPosition, { fontSize: 12, bold: true });
  yPosition += 8;
  addText(inspection.factoryAddress || '', margin, yPosition);
  yPosition += 8;

  // Google Maps Link
  if (inspection.mapLink) {
    addText("Google Maps Link:", margin, yPosition, { fontSize: 12, bold: true });
    yPosition += 6;
    addText(inspection.mapLink, margin, yPosition, { fontSize: 10 });
    yPosition += 10;
  }

  // Distance from airport
  addText("Factory is located approximately 45 minutes from the international airport", margin, yPosition);
  yPosition += 15;

  // Purpose of Visit
  addText("Purpose of Visit:", margin, yPosition, { fontSize: 12, bold: true });
  yPosition += 8;
  addText("Initial inspection for kosher certification to produce in the factory.", margin, yPosition);
  yPosition += 15;

  // Contact Person
  addText("Met at the factory with:", margin, yPosition, { fontSize: 12, bold: true });
  yPosition += 8;
  addText("(Must specify main contact person)", margin, yPosition, { fontSize: 10 });
  yPosition += 6;

  if (inspection.contactName) {
    addText(`Name: ${inspection.contactName}`, margin, yPosition);
    yPosition += 6;
  }
  if (inspection.contactPosition) {
    addText(`Position: ${inspection.contactPosition}`, margin, yPosition);
    yPosition += 6;
  }
  if (inspection.contactEmail) {
    addText(`Email: ${inspection.contactEmail}`, margin, yPosition);
    yPosition += 6;
  }
  if (inspection.contactPhone) {
    addText(`Phone: ${inspection.contactPhone}`, margin, yPosition);
    yPosition += 6;
  }
  yPosition += 10;

  // General Background
  addText("General Background:", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 10;
  addText("Brief general background about the factory should be filled.", margin, yPosition, { fontSize: 10 });
  yPosition += 8;

  if (inspection.currentProducts) {
    addText("What products do they currently manufacture?", margin, yPosition, { fontSize: 11, bold: true });
    yPosition += 6;
    addText(inspection.currentProducts, margin, yPosition, { fontSize: 10 });
    yPosition += 8;
  }

  addText("Does the factory manufacture products that include:", margin, yPosition, { fontSize: 11, bold: true });
  yPosition += 6;
  addText("• Meat", margin + 5, yPosition);
  yPosition += 5;
  addText("• Dairy", margin + 5, yPosition);
  yPosition += 5;
  addText("• Seafood", margin + 5, yPosition);
  yPosition += 5;
  addText("• Grape products", margin + 5, yPosition);
  yPosition += 5;
  addText("• Other", margin + 5, yPosition);
  yPosition += 10;

  if (inspection.employeeCount) {
    addText(`How many employees work at the factory? ${inspection.employeeCount}`, margin, yPosition);
    yPosition += 6;
  }

  if (inspection.shiftsPerDay) {
    addText(`How many shifts per day including shift hours? ${inspection.shiftsPerDay}`, margin, yPosition);
    yPosition += 6;
  }

  if (inspection.workingDays) {
    addText(`How many days per week do they work? ${inspection.workingDays}`, margin, yPosition);
    yPosition += 6;
  }
  yPosition += 8;

  addText("If there is a need to shut down the factory/production line from time to time for kosherization, would this be possible?", margin, yPosition);
  yPosition += 10;

  if (inspection.kashrut) {
    addText(`Do they currently have kosher certification? ${inspection.kashrut}`, margin, yPosition);
    yPosition += 6;
  }
  addText("Did they have kosher certification in the past? (If yes, why did it stop?)", margin, yPosition);
  yPosition += 15;

  // Check for new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Documents Section
  addText("Documents:", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 8;
  addText("The following documents should be requested and attached to the report:", margin, yPosition, { fontSize: 10 });
  yPosition += 10;

  const documents = inspection.documents || {};
  addText(`Master ingredient list (general ingredient list of the factory) - Required! ${documents.masterIngredientList ? 'YES' : 'NO'}`, margin, yPosition);
  yPosition += 6;
  addText(`Blueprint/Floor plan (factory layout drawing) - Recommended! ${documents.blueprint ? 'YES' : 'NO'}`, margin, yPosition);
  yPosition += 6;
  addText(`Flowchart (production process flow diagram) - Recommended! ${documents.flowchart ? 'YES' : 'NO'}`, margin, yPosition);
  yPosition += 6;
  addText(`Boiler blueprint (boiler layout drawing) - Not required! ${documents.boilerBlueprint ? 'YES' : 'NO'}`, margin, yPosition);
  yPosition += 15;

  // General Notes
  addText("General:", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 8;
  addText("Always good to check the company's website before the visit and get an initial impression of the factory!", margin, yPosition, { fontSize: 10 });
  yPosition += 6;
  addText("It's advisable to visit the showroom and see products that might pose kashrut issues.", margin, yPosition, { fontSize: 10 });
  yPosition += 6;
  addText("It's advisable to request a catalog and review it to see products that might pose kashrut issues.", margin, yPosition, { fontSize: 10 });
  yPosition += 15;

  // Factory Category
  addText("Factory Categorization:", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 8;
  addText("Before entering the production facility, try to classify the factory into a specific category:", margin, yPosition, { fontSize: 10 });
  yPosition += 8;

  if (inspection.category) {
    let categoryText = '';
    switch (inspection.category) {
      case 'treif':
        categoryText = 'Treif Category: (meat, seafood, non-Jewish cheese, etc.) - Factory has treif products, therefore must ensure kosherization solutions at every stage.';
        break;
      case 'issur':
        categoryText = 'Issur Category: (non-Jewish dairy, wine, etc.) - Factory has prohibited items, therefore must ensure kosherization solutions at every stage.';
        break;
      case 'g6':
        categoryText = 'G6 Category: (non-kosher products that do not make production lines treif)';
        break;
      case 'kosher':
        categoryText = 'Kosher Factory Category: (all ingredients are kosher or G1)';
        break;
    }
    addText(categoryText, margin, yPosition, { fontSize: 10 });
    yPosition += 15;
  }

  // Special Requirements
  addText("Special Requirements to Check (if applicable):", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 10;

  const specialRequirements = [
    { field: inspection.bishuYisrael, text: 'Bishul Yisrael (Jewish cooking)' },
    { field: inspection.afiyaYisrael, text: 'Afiyat Yisrael (Jewish baking)' },
    { field: inspection.chalavYisrael, text: 'Chalav Yisrael (Jewish dairy)' },
    { field: inspection.linatLaila, text: 'Linat Layla (overnight storage)' },
    { field: inspection.kavush, text: 'Kavush (pickling)' },
    { field: inspection.chadash, text: 'Chadash (new grain)' },
    { field: inspection.hafrashChalla, text: 'Hafrashat Challah (challah separation)' },
    { field: inspection.kashrutPesach, text: 'Kashrut for Passover' }
  ];

  specialRequirements.forEach(req => {
    if (req.field) {
      addText(`• ${req.text}`, margin, yPosition);
      yPosition += 6;
    }
  });

  yPosition += 10;

  // Ingredients Section
  addText("Ingredients:", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 8;
  addText("Request and attach to report: Master ingredient list (general ingredient list).", margin, yPosition, { fontSize: 10 });
  yPosition += 6;
  if (inspection.ingredients) {
    addText(inspection.ingredients, margin, yPosition, { fontSize: 10 });
    yPosition += 10;
  }

  // Check for new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Boiler Section
  addText("Boiler:", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 8;
  addText("Verify whether the steam system/boiler is returning or not.", margin, yPosition, { fontSize: 10 });
  yPosition += 6;
  addText("Verify if the boiler is shared with additional lines or other factories, and if so, whether there are prohibitions in the shared location.", margin, yPosition, { fontSize: 10 });
  yPosition += 6;
  if (inspection.boilerDetails) {
    addText(inspection.boilerDetails, margin, yPosition, { fontSize: 10 });
    yPosition += 10;
  }

  // Cleaning Section
  addText("Cleaning:", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 8;
  addText("Specify the level of cleanliness in the factory in general.", margin, yPosition, { fontSize: 10 });
  yPosition += 6;
  addText("Specify the cleaning protocol they have in the factory for each tool in the production process, including temperature and if there is a damaging agent.", margin, yPosition, { fontSize: 10 });
  yPosition += 6;
  if (inspection.cleaningProtocols) {
    addText(inspection.cleaningProtocols, margin, yPosition, { fontSize: 10 });
    yPosition += 10;
  }

  // Production Process
  addText("Production Process:", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 8;
  addText("Detail the production process as much as possible and specify at each stage the type of equipment (plastic/stainless steel/fabric, etc.)", margin, yPosition, { fontSize: 10 });
  yPosition += 6;
  addText("Also specify at each stage the temperature (minus/room temperature/number of degrees)", margin, yPosition, { fontSize: 10 });
  yPosition += 15;

  // Kosherization
  addText("Kosherization:", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 8;
  addText("Is kosherization needed in the factory?", margin, yPosition, { fontSize: 10 });
  yPosition += 6;
  addText("If kosherization is needed, specify and detail how you think it should be done for each tool and each line.", margin, yPosition, { fontSize: 10 });
  yPosition += 6;
  addText("Must be detailed and emphasize maximum temperature for each and every tool.", margin, yPosition, { fontSize: 10 });
  yPosition += 15;

  // Summary
  addText("Summary:", margin, yPosition, { fontSize: 14, bold: true });
  yPosition += 8;
  addText("(To prevent unnecessary grief) Never give approval to factory owners on site. You can say there is a positive direction or clarify with them the points that need clarification. The decision is only by the kashrut rabbis.", margin, yPosition, { fontSize: 10 });
  yPosition += 8;

  if (inspection.summary) {
    addText("Summary of main points:", margin, yPosition, { fontSize: 11, bold: true });
    yPosition += 6;
    addText(inspection.summary, margin, yPosition, { fontSize: 10 });
    yPosition += 8;
  }

  if (inspection.recommendations) {
    addText("Recommendations:", margin, yPosition, { fontSize: 11, bold: true });
    yPosition += 6;
    addText(inspection.recommendations, margin, yPosition, { fontSize: 10 });
    yPosition += 8;
  }

  if (inspection.inspectorOpinion) {
    addText("Inspector's Opinion:", margin, yPosition, { fontSize: 11, bold: true });
    yPosition += 6;
    addText(inspection.inspectorOpinion, margin, yPosition, { fontSize: 10 });
    yPosition += 15;
  }

  // Footer
  yPosition += 20;
  addText("Supervising Rabbi's Signature: ________________", margin, yPosition);
  yPosition += 10;
  addText("Phone and Email Address: ________________", margin, yPosition);
  yPosition += 15;
  addCenteredText('"With prayer that no fault will come from our hands"', yPosition, { fontSize: 10 });

  return new Promise((resolve) => {
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
}