const Fs = require("fs");
const Path = require("path");
const Util = require("util");
const Puppeteer = require("puppeteer");
const Handlebars = require("handlebars");
const ReadFile = Util.promisify(Fs.readFile);

class Invoice {
  async html(data) {
    try {
      //   const data = require("./moch.json");
      console.log(data);
      const templatePath = Path.resolve("src/pdf/templates/invoice.html");
      console.log({ templatePath });
      const content = await ReadFile(templatePath, "utf8");

      // compile and render the template with handlebars
      const template = Handlebars.compile(content);

      return template(data);
    } catch (error) {
      throw new Error("Cannot create invoice HTML template.");
    }
  }

  async pdf(data) {
    const html = await this.html(data);

    const browser = await Puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);

    return page.pdf();
  }
}

module.exports = Invoice;
