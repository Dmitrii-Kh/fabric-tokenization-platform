'use strict';

const {Contract} = require('fabric-contract-api');
const {ClientIdentity} = require('fabric-shim');
const VALIDATOR_FEE = 250;
const VALIDATOR_FEE_CURRENCY = "USDT";

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

        if (identity.cert.subject.organizationalUnitName === 'systemAdmin') {
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
                                supply: project.supply,
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
                        if (project.approved === true || project.approved === "true") {
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

        if (identity.cert.subject.organizationalUnitName === 'validator') {
            let result = []
            //todo check if no companies
            Object.entries(companiesAsObject).forEach(([key, value]) => {
                    if (value.projects.length === 0) return;
                    value.projects.forEach(project => {
                        if (project.approved === "false" || project.approved === false) {
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
    async depositValidator(ctx, validatorFullName, currency, amount) {
        const identity = new ClientIdentity(ctx.stub);
        // if (identity.cert.subject.organizationalUnitName !== 'systemAdmin') {
        //     throw new Error('Current subject does not have access to this function');
        // }
        const validatorsAsBytes = await ctx.stub.getState("validators");
        const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());
        //todo check whether investor exists

        let wallet = validatorsAsObject[validatorFullName].wallet;
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
        const newRecordInBytes = Buffer.from(JSON.stringify(validatorsAsObject));
        await ctx.stub.putState("validators", newRecordInBytes);
        return JSON.stringify(validatorsAsObject[validatorFullName], null, 2);
    }

    async depositCompanyProject(ctx, companyName, projectName, currency, amount){
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== 'company') {
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


    async getProject(ctx, projectName, companyName) {
        companyName = companyName || "";
        const identity = new ClientIdentity(ctx.stub);
        const companiesAsBytes = await ctx.stub.getState("companies");
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());
        let result = {};
        if (identity.cert.subject.organizationalUnitName === 'company') {
            companiesAsObject[identity.cert.subject.commonName].projects.forEach(proj => {
                if (proj.projectName === projectName) {
                    result = {companyName: identity.cert.subject.commonName, ...proj};
                }
            })
            return JSON.stringify(result, null, 2);
        }
        companiesAsObject[companyName].projects.forEach(proj => {
            if (proj.projectName === projectName) {
                result = {companyName: companyName, ...proj};
            }
        })
        return JSON.stringify(result, null, 2);

    }

    //todo check returns for valid response
    async approveProject(ctx, projectName, companyName) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== 'validator') {
            throw new Error('Current subject does not have access to this function');
        }
        const companiesAsBytes = await ctx.stub.getState("companies");
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());

        let approved = false;
        companiesAsObject[companyName].projects.forEach(proj => {
            if(proj.projectName === projectName){
                if(proj.wallet.length === 0) {
                    return JSON.stringify({message: "Project's portfolio is empty"});
                } else {
                    let inArr = false;
                    proj.wallet.forEach((record) => {
                        if (record.currencyName === VALIDATOR_FEE_CURRENCY) {
                            if(Number(record.amount) - Number(VALIDATOR_FEE) < 0) {
                                throw new Error("Project does not possess enough USDT");
                                return JSON.stringify({message: "Project does not possess enough USDT"}, null, 2);
                            } else {
                                record.amount = Number(record.amount) - Number(VALIDATOR_FEE);
                                proj.approved = true;
                                approved = "true";
                            }
                            inArr = true;
                        }
                    })
                    if(!inArr){
                        return JSON.stringify({message: "Project does not possess USDT"});
                    }
                }
            }
        })

        if(approved) {
            try {
               await this.addApprovedProject(ctx, companyName, projectName);
            } catch (e) {
                throw new Error("Error during adding project to validator's list!");
            }
        }

        const newRecordInBytes = Buffer.from(JSON.stringify(companiesAsObject));
        await ctx.stub.putState("companies", newRecordInBytes);
        return JSON.stringify(companiesAsObject[companyName], null, 2);

    }

    async addApprovedProject(ctx, companyName, projectName) {
        const identity = new ClientIdentity(ctx.stub);
        const validatorsAsBytes = await ctx.stub.getState("validators");
        const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());
        const validator = validatorsAsObject[identity.cert.subject.commonName];
        if(!validator.approvedProjects) {
            validator.approvedProjects = [];
        }
        validator.approvedProjects.push({
            companyName: companyName,
            projectName: projectName,
            approvalDate: Date.now()
        })

        let wallet = validatorsAsObject[identity.cert.subject.commonName].wallet;
        if (wallet.length === 0) {
            wallet.push({
                currencyName: VALIDATOR_FEE_CURRENCY,
                amount: Number(VALIDATOR_FEE)
            })
        } else {
            let inArr = false;
            wallet.forEach((record) => {
                if (record.currencyName === VALIDATOR_FEE_CURRENCY) {
                    record.amount = Number(record.amount) + Number(VALIDATOR_FEE);
                    inArr = true;
                }
            })
            if(!inArr){
                wallet.push({
                    currencyName: VALIDATOR_FEE_CURRENCY,
                    amount: Number(VALIDATOR_FEE)
                })
            }
        }

        await ctx.stub.putState("validators", Buffer.from(JSON.stringify(validatorsAsObject)));
    }

    async getInvestors(ctx) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== 'systemAdmin') {
            throw new Error('Current subject does not have access to this function');
        }
        const investorsAsBytes = await ctx.stub.getState("investors");
        const investorsAsObject = JSON.parse(investorsAsBytes.toString());

        return JSON.stringify(Object.keys(investorsAsObject), null, 2);
    }


    async investToProject(ctx, investorFullName, companyName, projectName, currency, amount) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== 'systemAdmin') {
            throw new Error('Current subject does not have access to this function');
        }
        const investorsAsBytes = await ctx.stub.getState("investors");
        const investorsAsObject = JSON.parse(investorsAsBytes.toString());
        const investorWallet = investorsAsObject[investorFullName].wallet;


        //withdraw investor's money
        if(investorWallet.length === 0) {
            //todo send response
            throw new Error("Current investor's portfolio is empty");
        }else {
            let inArr = false;
            investorWallet.forEach((record) => {
                if (record.currencyName === currency) {
                    if(Number(record.amount) - Number(amount) < 0) {
                        throw new Error(`Current investor does not possess enough ${currency}`);
                    } else {
                        record.amount = Number(record.amount) - Number(amount);
                    }
                    inArr = true;
                }
            })
            if(!inArr){
                throw new Error("Current investor does not possess this token");
            }
        }


        const projToInvestAsString = await this.getProject(ctx, projectName, companyName);
        const projToInvest = JSON.parse(projToInvestAsString);

        const projectTokenAmount = Number(amount) / Number(projToInvest.priceInUSDT);

        //check whether its possible to withdraw this amount from project
        //write this amount to [supply]
        const companiesAsBytes = await ctx.stub.getState("companies");
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());


        companiesAsObject[companyName].projects.forEach(proj => {
            if(proj.projectName === projectName){
                if(!proj["supply"]) {
                    proj["supply"] = 0;
                }
                if(Number(proj.emission) - (Number(proj.supply) + Number(projectTokenAmount)) < 0) {
                    throw new Error("Impossible to withdraw project token, not enough!");
                } else {
                  proj.supply = Number(proj.supply)+ Number(projectTokenAmount);
                }
            }
        })



        // deposit investor
        let inArr = false;
        investorWallet.forEach((record) => {
            if (record.currencyName === projToInvest.tokenName) {
                record.amount = Number(record.amount) + Number(projectTokenAmount);
                inArr = true;
            }
        })
        if(!inArr){
            investorWallet.push({
                currencyName: projToInvest.tokenName,
                amount: Number(projectTokenAmount)
            })
        }

        // deposit project
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

        await ctx.stub.putState("investors", Buffer.from(JSON.stringify(investorsAsObject)));
        await ctx.stub.putState("companies", Buffer.from(JSON.stringify(companiesAsObject)));

        return JSON.stringify(investorsAsObject[investorFullName], null, 2);
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
