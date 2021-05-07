'use strict';

const { Contract } = require('fabric-contract-api');
const { ClientIdentity } = require('fabric-shim');

class TokenizationPlatformStorage extends Contract {
  constructor() {
    super('org.fabric.tokenizationPlatformStorage');
  }

  async createWireframe(ctx) {
    const investorsAsBytes = await ctx.stub.getState("investors");
    const validatorsAsBytes = await ctx.stub.getState("validators");
    const companiesAsBytes = await ctx.stub.getState("companies");

    //todo rethink logic
    if(!!investorsAsBytes && investorsAsBytes.toString().length !== 0){
      throw new Error('Investors collection already exist');
    }

    if(!!validatorsAsBytes && validatorsAsBytes.toString().length !== 0){
      throw new Error('Validators collection already exist');
    }

    if(!!companiesAsBytes && companiesAsBytes.toString().length !== 0){
      throw new Error('Companies collection already exist');
    }

    const investorsObj = {};
    const validatorsObj = {};
    const companiesObj = {};

    await ctx.stub.putState("investors", Buffer.from(JSON.stringify(investorsObj)));
    await ctx.stub.putState("validators", Buffer.from(JSON.stringify(validatorsObj)));
    await ctx.stub.putState("companies", Buffer.from(JSON.stringify(companiesObj)));
    return JSON.stringify({message: "Wireframe created!"}, null, 2);
  }

  async getInvestorsData(ctx) {
    const recordAsBytes = await ctx.stub.getState("investors");
    return recordAsBytes.toString();
  }

  async getValidatorsData(ctx) {
    const recordAsBytes = await ctx.stub.getState("validators");
    return recordAsBytes.toString();
  }

  async getCompaniesData(ctx) {
    const recordAsBytes = await ctx.stub.getState("companies");
    return recordAsBytes.toString();
  }


  async createInvestor(ctx, investorFullName) {
    const investorsAsBytes = await ctx.stub.getState("investors");

    const investorsAsObject = JSON.parse(investorsAsBytes.toString());
    if(!!investorsAsObject[investorFullName] && investorsAsObject[investorFullName].toString().length !== 0){
      throw new Error('Investor with the current name already exist');
    }

    investorsAsObject[investorFullName]= {
      wallet: []
    }
    const newRecordInBytes = Buffer.from(JSON.stringify(investorsAsObject));
    await ctx.stub.putState("investors", newRecordInBytes);
    return JSON.stringify(investorsAsObject, null, 2);
  }

  async createValidator(ctx, validatorFullName) {
    const validatorsAsBytes = await ctx.stub.getState("validators");

    const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());
    if(!!validatorsAsObject[validatorFullName] && validatorsAsObject[validatorFullName].toString().length !== 0){
      throw new Error('Validator with the current name already exist');
    }

    validatorsAsObject[validatorFullName]= {
      wallet: []
    }
    const newRecordInBytes = Buffer.from(JSON.stringify(validatorsAsObject));
    await ctx.stub.putState("validators", newRecordInBytes);
    return JSON.stringify(validatorsAsObject, null, 2);
  }

  async createCompany(ctx, companyName) {
    const companiesAsBytes = await ctx.stub.getState("companies");

    const companiesAsObject = JSON.parse(companiesAsBytes.toString());
    if(!!companiesAsObject[companyName] && companiesAsObject[companyName].toString().length !== 0){
      throw new Error('Company with the current name already exist');
    }

    companiesAsObject[companyName]= {
      projects: []
    }
    const newRecordInBytes = Buffer.from(JSON.stringify(companiesAsObject));
    await ctx.stub.putState("companies", newRecordInBytes);
    return JSON.stringify(companiesAsObject, null, 2);
  }

  async signInToPlatform(ctx) {
    const identity = new ClientIdentity(ctx.stub);
    const userData = {
      commonName: identity.cert.subject.commonName,
      affiliation: identity.cert.subject.organizationalUnitName
    }
    return JSON.stringify(userData, null, 2);
  }


  async createStudentRecord(ctx, studentEmail, fullName) {
    const identity = new ClientIdentity(ctx.stub);
    if (identity.cert.subject.organizationalUnitName !== 'teacher') {
      throw new Error('Current subject is not have access to this function');
    }
    const recordAsBytes = await ctx.stub.getState(studentEmail);
    // if(!recordAsBytes || recordAsBytes.toString().length !== 0){
    //   throw new Error('Student with the current email already exist');
    // }
    const recordExample = {
      fullName: fullName,
      semesters: []
    }
    const newRecordInBytes = Buffer.from(JSON.stringify(recordExample));
    await ctx.stub.putState(studentEmail, newRecordInBytes);
    return JSON.stringify(recordExample, null, 2);
  }

  async addSubjectToStudentRecord(ctx, studentEmail, semesterNumber, subjectName) {
    const identity = new ClientIdentity(ctx.stub);
    if (identity.cert.subject.organizationalUnitName !== 'teacher') {
      throw new Error('Current subject is not have access to this function');
    }
    const recordAsBytes = await ctx.stub.getState(studentEmail);
    const recordAsObject = JSON.parse(recordAsBytes.toString());
    recordAsObject.semesters[semesterNumber][subjectName] = {
      lector: identity.cert.subject.commonName,
      themes: []
    }
    const newRecordInBytes = Buffer.from(JSON.stringify(recordAsObject));
    await ctx.stub.putState(studentEmail, newRecordInBytes);
    return JSON.stringify(recordAsObject, null, 2);
  }
}

module.exports = TokenizationPlatformStorage;
