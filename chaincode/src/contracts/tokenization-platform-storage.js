'use strict';

const {Contract} = require('fabric-contract-api');
const {ClientIdentity} = require('fabric-shim');

class TokenizationPlatformStorage extends Contract {
    constructor() {
        super('org.fabric.tokenizationPlatformStorage');
    }

    async createWireframe(ctx) {
        const investorsAsBytes = await ctx.stub.getState("investors");
        const validatorsAsBytes = await ctx.stub.getState("validators");
        const companiesAsBytes = await ctx.stub.getState("companies");

        //todo rethink logic
        if (!!investorsAsBytes && investorsAsBytes.toString().length !== 0) {
            throw new Error('Investors collection already exist');
        }

        if (!!validatorsAsBytes && validatorsAsBytes.toString().length !== 0) {
            throw new Error('Validators collection already exist');
        }

        if (!!companiesAsBytes && companiesAsBytes.toString().length !== 0) {
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
        if (!!investorsAsObject[investorFullName] && investorsAsObject[investorFullName].toString().length !== 0) {
            throw new Error('Investor with the current name already exist');
        }

        investorsAsObject[investorFullName] = {
            wallet: []
        }
        const newRecordInBytes = Buffer.from(JSON.stringify(investorsAsObject));
        await ctx.stub.putState("investors", newRecordInBytes);
        return JSON.stringify(investorsAsObject, null, 2);
    }

    async createValidator(ctx, validatorFullName) {
        const validatorsAsBytes = await ctx.stub.getState("validators");

        const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());
        if (!!validatorsAsObject[validatorFullName] && validatorsAsObject[validatorFullName].toString().length !== 0) {
            throw new Error('Validator with the current name already exist');
        }

        validatorsAsObject[validatorFullName] = {
            wallet: []
        }
        const newRecordInBytes = Buffer.from(JSON.stringify(validatorsAsObject));
        await ctx.stub.putState("validators", newRecordInBytes);
        return JSON.stringify(validatorsAsObject, null, 2);
    }

    async createCompany(ctx, companyName) {
        const companiesAsBytes = await ctx.stub.getState("companies");

        const companiesAsObject = JSON.parse(companiesAsBytes.toString());
        if (!!companiesAsObject[companyName] && companiesAsObject[companyName].toString().length !== 0) {
            throw new Error('Company with the current name already exist');
        }

        companiesAsObject[companyName] = {
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


    async createNewProject(ctx, projectName, projectDescription, emission, tokenName, priceInUSDT) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== 'company') {
            throw new Error('Current subject does not have access to this function');
        }

        const companiesAsBytes = await ctx.stub.getState("companies");
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());

        //todo check whether this project already exists
        companiesAsObject[identity.cert.subject.commonName].projects.push(
            {
                projectName: projectName,
                projectDescription: projectDescription,
                emission: emission,
                tokenName: tokenName,
                priceInUSDT: priceInUSDT,
                approved: false,
                wallet: [
                    {
                        currencyName: "USDT",
                        amount: 500
                    }
                ]
            }
        );

        const newRecordInBytes = Buffer.from(JSON.stringify(companiesAsObject));
        await ctx.stub.putState("companies", newRecordInBytes);
        return JSON.stringify(companiesAsObject[identity.cert.subject.commonName], null, 2);

    }

    async getAllProjects(ctx) {
        const identity = new ClientIdentity(ctx.stub);
        const companiesAsBytes = await ctx.stub.getState("companies");
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());

        if (identity.cert.subject.organizationalUnitName === 'company') {
            return JSON.stringify(companiesAsObject[identity.cert.subject.commonName].projects, null, 2);
        }

        if (identity.cert.subject.organizationalUnitName === 'systemAdmin' || identity.cert.subject.organizationalUnitName === 'validator') {
            let result = []
            //todo check if no companies
            Object.entries(companiesAsObject).forEach(([key, value]) => {
                    if (value.projects.length === 0) return;
                    value.projects.forEach(project => {
                        result.push(
                            {
                                companyName: key,
                                projectName: project.projectName,
                                projectDescription: project.projectDescription,
                                emission: project.emission,
                                tokenName: project.tokenName,
                                priceInUSDT: project.priceInUSDT,
                                approved: project.approved
                            }
                        )
                    })
                }
            );

            return JSON.stringify(result, null, 2);
        }

        if (identity.cert.subject.organizationalUnitName === 'investor') {
            let result = []
            //todo check if no companies
            Object.entries(companiesAsObject).forEach(([key, value]) => {
                    if (value.projects.length === 0) return;
                    value.projects.forEach(project => {
                        if (project.approved === true) {
                            result.push(
                                {
                                    companyName: key,
                                    projectName: project.projectName,
                                    projectDescription: project.projectDescription,
                                    emission: project.emission,
                                    tokenName: project.tokenName,
                                    priceInUSDT: project.priceInUSDT,
                                    approved: project.approved
                                }
                            )
                        }

                    })
                }
            );

            return JSON.stringify(result, null, 2);
        }

    }


    async depositInvestor(ctx, investorFullName, currency, amount) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== 'systemAdmin') {
            throw new Error('Current subject does not have access to this function');
        }
        const investorsAsBytes = await ctx.stub.getState("investors");
        const investorsAsObject = JSON.parse(investorsAsBytes.toString());
        //todo check whether investor exists

        let wallet = investorsAsObject[investorFullName].wallet;
        if (wallet.length === 0) {
            wallet.push({
                currencyName: currency,
                amount: Number(amount)
            })
        } else {
            let inArr = false;
            wallet.forEach((record) => {
                if (record.currencyName === currency) {
                    record.amount = Number(record.amount) + Number(amount);
                    inArr = true;
                }
            })
            if(!inArr){
                wallet.push({
                    currencyName: currency,
                    amount: Number(amount)
                })
            }
        }
        const newRecordInBytes = Buffer.from(JSON.stringify(investorsAsObject));
        await ctx.stub.putState("investors", newRecordInBytes);
        return JSON.stringify(investorsAsObject[investorFullName], null, 2);
    }

    //todo deposit validator

    async depositCompanyProject(ctx, companyName, projectName, currency, amount){
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== 'systemAdmin') {
            throw new Error('Current subject does not have access to this function');
        }
        const companiesAsBytes = await ctx.stub.getState("companies");
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());


        companiesAsObject[companyName].projects.forEach(proj => {
            if(proj.projectName === projectName){
                if(proj.wallet.length === 0) {
                    proj.wallet.push({
                        currencyName: currency,
                        amount: Number(amount)
                    })
                } else {
                    let inArr = false;
                    proj.wallet.forEach((record) => {
                        if (record.currencyName === currency) {
                            record.amount = Number(record.amount) + Number(amount);
                            inArr = true;
                        }
                    })
                    if(!inArr){
                        proj.wallet.push({
                            currencyName: currency,
                            amount: Number(amount)
                        })
                    }
                }
            }
        })

        const newRecordInBytes = Buffer.from(JSON.stringify(companiesAsObject));
        await ctx.stub.putState("companies", newRecordInBytes);
        return JSON.stringify(companiesAsObject[companyName], null, 2);
    }

    async getInvestorWallet(ctx, investorFullName) {
        investorFullName = investorFullName || "";
        const identity = new ClientIdentity(ctx.stub);
        const investorsAsBytes = await ctx.stub.getState("investors");
        const investorsAsObject = JSON.parse(investorsAsBytes.toString());
        if (identity.cert.subject.organizationalUnitName === 'systemAdmin') {
            return JSON.stringify(investorsAsObject[investorFullName].wallet, null, 2);
        }
        if(identity.cert.subject.organizationalUnitName === 'investor') {
            return JSON.stringify(investorsAsObject[identity.cert.subject.commonName].wallet, null, 2);
        }
    }


    async getValidatorWallet(ctx, validatorFullName) {
        validatorFullName = validatorFullName || "";
        const identity = new ClientIdentity(ctx.stub);
        const validatorsAsBytes = await ctx.stub.getState("validators");
        const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());
        if (identity.cert.subject.organizationalUnitName === 'systemAdmin') {
            return JSON.stringify(validatorsAsObject[validatorFullName].wallet, null, 2);
        }
        if(identity.cert.subject.organizationalUnitName === 'validator') {
            return JSON.stringify(validatorsAsObject[identity.cert.subject.commonName].wallet, null, 2);
        }
    }

    async getProjectWallet(ctx, projectName, companyName) {
        companyName = companyName || "";
        const identity = new ClientIdentity(ctx.stub);
        const companiesAsBytes = await ctx.stub.getState("companies");
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());
        let result = [];
        //todo into one function
        if (identity.cert.subject.organizationalUnitName === 'systemAdmin') {
            companiesAsObject[companyName].projects.forEach(proj => {
                if(proj.projectName === projectName) {
                    proj.wallet.forEach(record => {
                        result.push(record);
                    })
                }
            })
            return JSON.stringify(result, null, 2);
        }
        if(identity.cert.subject.organizationalUnitName === 'company') {
            companiesAsObject[identity.cert.subject.commonName].projects.forEach(proj => {
                if(proj.projectName === projectName) {
                    proj.wallet.forEach(record => {
                        result.push(record);
                    })
                }
            })
            return JSON.stringify(result, null, 2);
        }

        //throw new Error('Current subject does not have access to this function');
    }


    //deprecated
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
