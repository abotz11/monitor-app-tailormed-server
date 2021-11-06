const puppeteer = require("puppeteer");
const AssistanceProgram = require("../models/assistanceProgram.schema");
const dl = require("../dataLayerLogic/dataLayerLogic");

InitializeAssistanceProgramsAsync();

async function InitializeAssistanceProgramsAsync() {
  console.log("InitializeAssistanceProgramsAsync Started");
  let assistancePrograms = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.healthwellfoundation.org/disease-funds");

  //open closed programs
  await page.waitForSelector("div > .subsection > .filters > .closed > a");
  await page.click("div > .subsection > .filters > .closed > a");

  for (let i = 1; i < 6; i++) {
    await page.waitForSelector(
      `div > .subsection > .funds > li:nth-child(${i}) > a`
    );

    //program name
    const [programName, link] = await page.evaluate(
      (i) => [
        document.querySelector(
          `div > .subsection > .funds > li:nth-child(${i}) > a`
        ).textContent,
        document.querySelector(
          `div > .subsection > .funds > li:nth-child(${i}) > a`
        )["href"],
      ],
      i
    );

    assistancePrograms.push(
      await InitializeAssistanceProgramAsync(programName, link)
    );
  }
  await dl.InsertManyAsync(assistancePrograms);

  await browser.close();
}

async function InitializeAssistanceProgramAsync(programName, link) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(link);

  await page.waitForSelector(
    "#fund-details > div.treatments-covered > div > div > div > ul"
  );

  //get the treatment items and iterate it and move to their page and scrape their info
  var [ulElement] = await page.$$(
    "#fund-details > div.treatments-covered > div > div > div > ul"
  );

  let treatmentList = [];

  const items = await ulElement.$x("li");
  for (let item of items) {
    const treatmentTxt = await item.getProperty("textContent");
    let treatment = await treatmentTxt.jsonValue();
    treatmentList.push(treatment);
  }

  await page.waitForSelector(
    "div > #fund-details > .details > .row:nth-child(1) > div:nth-child(1)"
  );

  //get the status (open/close)
  const [, statusElement] = await page.$x(
    '//*[@id="fund-details"]/div[1]/div[1]/div[1]/text()'
  );

  const statusTxt = await statusElement.getProperty("textContent");
  let status = await statusTxt.jsonValue();
  status = status.replace(/\s/g, "");

  await page.waitForSelector(
    "div > #fund-details > .details > .row:nth-child(2) > div:nth-child(1)"
  );

  //get the Grant Amount (Maximum Award Level)
  const [, grantAmountElement] = await page.$x(
    '//*[@id="fund-details"]/div[1]/div[2]/div[1]/text()'
  );
  const grantAmountTxt = await grantAmountElement.getProperty("textContent");
  let grantAmount = await grantAmountTxt.jsonValue();
  grantAmount = grantAmount.replace(/\s/g, "");

  await browser.close();

  assistanceProgram = {
    programName: programName,
    treatmentList: treatmentList,
    status: status,
    grantAmount: grantAmount,
  };

  return assistanceProgram;
}

async function UpdateAssistanceProgramAsync(callback) {
  //get all the names from db
  const programNames = await dl.GetManyAsync(null, "programName", callback);
  let assistanceProgramsToUpdate = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.healthwellfoundation.org/disease-funds");

  //open closed programs
  await page.waitForSelector("div > .subsection > .filters > .closed > a");
  await page.click("div > .subsection > .filters > .closed > a");

  for (let programName in programNames) {
    //find their href
    let link = Array.from(document.querySelectorAll("li > a")).find(
      (el) => el.textContent === programName
    )["href"];

    assistanceProgramsToUpdate.push(
      await InitializeAssistanceProgramAsync(programName, link)
    );
  }

  await dl.UpdateManyAsync(assistanceProgramsToUpdate, callback);

  await browser.close();
}

async function UpdateAssistanceProgramManuallyAsync(callback) {
  console.log("UpdateAssistanceProgramManuallyAsync Started");
  assistanceProgramsToUpdate = [];

  //get all the names from db
  await dl.GetManyAsync(null, "programName", (programs) => {
    console.log(`programNames: ${programs}`);

    for (let program in programs) {
      newProgram = {
        programName: program.programName,
        treatmentList: [],
        status: "NEW",
        grantAmount: "$10",
      };

      assistanceProgramsToUpdate.push(newProgram);
    }
  });

  console.log(`assistanceProgramsToUpdate: ${assistanceProgramsToUpdate}`);
  callback(await dl.UpdateManyAsync(assistanceProgramsToUpdate));
}

async function GetAllAssistanceProgramsAsync(callback) {
  return await dl.GetManyAsync(null, null, callback);
}

module.exports.InitializeAssistanceProgramsAsync =
  InitializeAssistanceProgramsAsync;

module.exports.UpdateAssistanceProgramAsync = UpdateAssistanceProgramAsync;
module.exports.GetAllAssistanceProgramsAsync = GetAllAssistanceProgramsAsync;

module.exports.UpdateAssistanceProgramManuallyAsync =
  UpdateAssistanceProgramManuallyAsync;
