const Invoice = require("./../lib/pdf");

const pdfService = {
  pdf: data => {
    const invoice = new Invoice();
    return invoice.pdf(data);
  }
};
module.exports = pdfService;
