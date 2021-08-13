'use strict';

const {Contract} = require('fabric-contract-api');
const {ClientIdentity} = require('fabric-shim');

const VALIDATOR_FEE = 250;
const VALIDATOR_FEE_CURRENCY = "USDT";
const INVESTMENT_CURRENCY = "USDT";

const COMPANIES_COLLECTION = "companies";
const INVESTORS_COLLECTION = "investors";
const VALIDATORS_COLLECTION = "validators";

const COMPANY_UNIT = "company";
const VALIDATOR_UNIT = "validator";
const INVESTOR_UNIT = "investor";
const SYS_ADMIN = "systemAdmin";


class TokenizationPlatformStorage extends Contract {
    constructor() {
        super('org.fabric.tokenizationPlatformStorage');
    }


    async createWireframe(ctx) {
        const investorsAsBytes = await ctx.stub.getState(INVESTORS_COLLECTION);
        const validatorsAsBytes = await ctx.stub.getState(VALIDATORS_COLLECTION);
        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);

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

        await ctx.stub.putState(INVESTORS_COLLECTION, Buffer.from(JSON.stringify(investorsObj)));
        await ctx.stub.putState(VALIDATORS_COLLECTION, Buffer.from(JSON.stringify(validatorsObj)));
        await ctx.stub.putState(COMPANIES_COLLECTION, Buffer.from(JSON.stringify(companiesObj)));
        return JSON.stringify({message: "Wireframe created!"}, null, 2);
    }

    async getInvestorsData(ctx) {
        const recordAsBytes = await ctx.stub.getState(INVESTORS_COLLECTION);
        return recordAsBytes.toString();
    }

    async getValidatorsData(ctx) {
        const recordAsBytes = await ctx.stub.getState(VALIDATORS_COLLECTION);
        return recordAsBytes.toString();
    }

    async getCompaniesData(ctx) {
        const recordAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);
        return recordAsBytes.toString();
    }


    async createInvestor(ctx, investorUID, investorFullName) {
        const investorsAsBytes = await ctx.stub.getState(INVESTORS_COLLECTION);

        const investorsAsObject = JSON.parse(investorsAsBytes.toString());
        if (!!investorsAsObject[investorUID] && investorsAsObject[investorUID].toString().length !== 0) {
            throw new Error('Investor with the current name already exist');
        }

        investorsAsObject[investorUID] = {
            investorFullName: investorFullName,
            wallet: []
        }
        const newRecordInBytes = Buffer.from(JSON.stringify(investorsAsObject));
        await ctx.stub.putState(INVESTORS_COLLECTION, newRecordInBytes);
        return JSON.stringify(investorsAsObject, null, 2);
    }

    async createValidator(ctx, validatorUID, validatorFullName) {
        const validatorsAsBytes = await ctx.stub.getState(VALIDATORS_COLLECTION);

        const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());
        if (!!validatorsAsObject[validatorUID] && validatorsAsObject[validatorUID].toString().length !== 0) {
            throw new Error('Validator with the current name already exist');
        }

        validatorsAsObject[validatorUID] = {
            validatorFullName: validatorFullName,
            wallet: []
        }
        const newRecordInBytes = Buffer.from(JSON.stringify(validatorsAsObject));
        await ctx.stub.putState(VALIDATORS_COLLECTION, newRecordInBytes);
        return JSON.stringify(validatorsAsObject, null, 2);
    }

    async createCompany(ctx, companyUID, companyName) {
        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);

        const companiesAsObject = JSON.parse(companiesAsBytes.toString());
        if (!!companiesAsObject[companyUID] && companiesAsObject[companyUID].toString().length !== 0) {
            throw new Error('Company with the current name already exist');
        }

        companiesAsObject[companyUID] = {
            companyName: companyName,
            projects: []
        }
        const newRecordInBytes = Buffer.from(JSON.stringify(companiesAsObject));
        await ctx.stub.putState(COMPANIES_COLLECTION, newRecordInBytes);
        return JSON.stringify(companiesAsObject, null, 2);
    }

    async signInToPlatform(ctx) {
        const identity = new ClientIdentity(ctx.stub);

        let COLL_NAME = undefined;
        let field = undefined;
        switch (identity.cert.subject.organizationalUnitName) {
            case "investor":
                COLL_NAME = "investors";
                field = "investorFullName";
                break;
            case "validator":
                COLL_NAME = "validators";
                field = "validatorFullName";
                break;
            case "company":
                COLL_NAME = "companies";
                field = "companyName";
                break;
            default:
                break;
        }

        let fullName = "";
        if(!!COLL_NAME) {
            const collectionAsBytes = await ctx.stub.getState(COLL_NAME);
            const collectionAsObject = JSON.parse(collectionAsBytes.toString());
            fullName = collectionAsObject[identity.cert.subject.commonName][field];
        }
        const userData = {
            commonName: identity.cert.subject.commonName,
            fullName: fullName,
            affiliation: identity.cert.subject.organizationalUnitName
          }
        return JSON.stringify(userData, null, 2);
    }


    async createNewProject(ctx, projectName, projectDescription, totalSupply, tokenName, priceInUSDT) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== COMPANY_UNIT) {
            throw new Error('Current subject does not have access to this function');
        }

        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());


        companiesAsObject[identity.cert.subject.commonName].projects.push(
            {
                projectName: projectName,
                projectDescription: projectDescription,
                totalSupply: totalSupply,
                supply: 0,
                tokenName: tokenName,
                priceInUSDT: priceInUSDT,
                approved: "false",
                wallet: []
            }
        );

        const newRecordInBytes = Buffer.from(JSON.stringify(companiesAsObject));
        await ctx.stub.putState(COMPANIES_COLLECTION, newRecordInBytes);
        return JSON.stringify({data: ctx.stub.getTxID()}, null, 2);

    }

    async getAllProjects(ctx) {
        const identity = new ClientIdentity(ctx.stub);
        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());

        let result = []

        if (identity.cert.subject.organizationalUnitName === COMPANY_UNIT) {
            companiesAsObject[identity.cert.subject.commonName].projects.forEach(project => {
                result.push({
                    companyUID: identity.cert.subject.commonName,
                    companyName: companiesAsObject[identity.cert.subject.commonName].companyName, ...project
                })
            })
        }

        if (identity.cert.subject.organizationalUnitName === SYS_ADMIN) {
            Object.entries(companiesAsObject).forEach(([key, value]) => {
                    if (value.projects.length === 0) return;
                    value.projects.forEach(project => {
                        result.push(
                            {
                                companyUID: key,
                                companyName: value.companyName,
                                ...project
                            }
                        )
                    })
                }
            );
        }

        if (identity.cert.subject.organizationalUnitName === INVESTOR_UNIT) {
            Object.entries(companiesAsObject).forEach(([key, value]) => {
                    if (value.projects.length === 0) return;
                    value.projects.forEach(project => {
                        if (project.approved === true || project.approved === "true") {
                            result.push(
                                {
                                    companyUID: key,
                                    companyName: value.companyName,
                                    ...project
                                }
                            )
                        }

                    })
                }
            );
        }

        if (identity.cert.subject.organizationalUnitName === VALIDATOR_UNIT) {
            Object.entries(companiesAsObject).forEach(([key, value]) => {
                    if (value.projects.length === 0) return;
                    value.projects.forEach(project => {
                        if (project.approved === "false" || project.approved === false) {
                            result.push(
                                {
                                    companyUID: key,
                                    companyName: value.companyName,
                                    ...project
                                }
                            )
                        }

                    })
                }
            );
        }

        return JSON.stringify(result, null, 2);
    }


    async depositInvestor(ctx, investorUID, currency, amount) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== SYS_ADMIN) {
            throw new Error('Current subject does not have access to this function');
        }
        const investorsAsBytes = await ctx.stub.getState(INVESTORS_COLLECTION);
        const investorsAsObject = JSON.parse(investorsAsBytes.toString());

        let wallet = investorsAsObject[investorUID].wallet;
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
            if (!inArr) {
                wallet.push({
                    currencyName: currency,
                    amount: Number(amount)
                })
            }
        }
        const newRecordInBytes = Buffer.from(JSON.stringify(investorsAsObject));
        await ctx.stub.putState(INVESTORS_COLLECTION, newRecordInBytes);
        return JSON.stringify(investorsAsObject[investorUID], null, 2);
    }

    async depositValidator(ctx, validatorUID, currency, amount) {
        const identity = new ClientIdentity(ctx.stub);
        // if (identity.cert.subject.organizationalUnitName !== 'systemAdmin') {
        //     throw new Error('Current subject does not have access to this function');
        // }
        const validatorsAsBytes = await ctx.stub.getState(VALIDATORS_COLLECTION);
        const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());

        let wallet = validatorsAsObject[validatorUID].wallet;
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
            if (!inArr) {
                wallet.push({
                    currencyName: currency,
                    amount: Number(amount)
                })
            }
        }
        const newRecordInBytes = Buffer.from(JSON.stringify(validatorsAsObject));
        await ctx.stub.putState(VALIDATORS_COLLECTION, newRecordInBytes);
        return JSON.stringify(validatorsAsObject[validatorUID], null, 2);
    }

    async depositCompanyProject(ctx, companyUID, projectName, currency, amount) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== COMPANY_UNIT) {
            throw new Error('Current subject does not have access to this function');
        }
        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());


        companiesAsObject[companyUID].projects.forEach(proj => {
            if (proj.projectName === projectName) {
                if (proj.wallet.length === 0) {
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
                    if (!inArr) {
                        proj.wallet.push({
                            currencyName: currency,
                            amount: Number(amount)
                        })
                    }
                }
            }
        })

        const newRecordInBytes = Buffer.from(JSON.stringify(companiesAsObject));
        await ctx.stub.putState(COMPANIES_COLLECTION, newRecordInBytes);
        return JSON.stringify(companiesAsObject[companyUID], null, 2);
    }


    async getInvestorWallet(ctx, investorUID) {
        investorUID = investorUID || "";
        const identity = new ClientIdentity(ctx.stub);
        const investorsAsBytes = await ctx.stub.getState(INVESTORS_COLLECTION);
        const investorsAsObject = JSON.parse(investorsAsBytes.toString());
        if (identity.cert.subject.organizationalUnitName === SYS_ADMIN) {
            return JSON.stringify(investorsAsObject[investorUID].wallet, null, 2);
        }
        if (identity.cert.subject.organizationalUnitName === INVESTOR_UNIT) {
            return JSON.stringify(investorsAsObject[identity.cert.subject.commonName].wallet, null, 2);
        }
    }

    async getValidatorWallet(ctx, validatorUID) {
        validatorUID = validatorUID || "";
        const identity = new ClientIdentity(ctx.stub);
        const validatorsAsBytes = await ctx.stub.getState(VALIDATORS_COLLECTION);
        const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());
        if (identity.cert.subject.organizationalUnitName === SYS_ADMIN) {
            return JSON.stringify(validatorsAsObject[validatorUID].wallet, null, 2);
        }
        if (identity.cert.subject.organizationalUnitName === VALIDATOR_UNIT) {
            return JSON.stringify(validatorsAsObject[identity.cert.subject.commonName].wallet, null, 2);
        }
    }

    async getProjectWallet(ctx, projectName, companyUID) {
        companyUID = companyUID || "";
        const identity = new ClientIdentity(ctx.stub);
        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());
        let result = [];
        if (identity.cert.subject.organizationalUnitName === SYS_ADMIN) {
            companiesAsObject[companyUID].projects.forEach(proj => {
                if (proj.projectName === projectName) {
                    proj.wallet.forEach(record => {
                        result.push(record);
                    })
                }
            })
            return JSON.stringify(result, null, 2);
        }
        if (identity.cert.subject.organizationalUnitName === COMPANY_UNIT) {
            companiesAsObject[identity.cert.subject.commonName].projects.forEach(proj => {
                if (proj.projectName === projectName) {
                    proj.wallet.forEach(record => {
                        result.push(record);
                    })
                }
            })
            return JSON.stringify(result, null, 2);
        }

        //throw new Error('Current subject does not have access to this function');
    }

    async getValidatorApprovals(ctx, validatorUID) {
        validatorUID = validatorUID || "";
        const identity = new ClientIdentity(ctx.stub);
        const validatorsAsBytes = await ctx.stub.getState(VALIDATORS_COLLECTION);
        const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());
        if (identity.cert.subject.organizationalUnitName === SYS_ADMIN) {
            return JSON.stringify(validatorsAsObject[validatorUID].approvedProjects || [], null, 2);
        }
        if (identity.cert.subject.organizationalUnitName === VALIDATOR_UNIT) {
            return JSON.stringify(validatorsAsObject[identity.cert.subject.commonName].approvedProjects || [], null, 2);
        }
    }


    async getProject(ctx, projectName, companyUID) {
        companyUID = companyUID || "";
        const identity = new ClientIdentity(ctx.stub);
        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());
        let result = {};
        if (identity.cert.subject.organizationalUnitName === COMPANY_UNIT) {
            companiesAsObject[identity.cert.subject.commonName].projects.forEach(proj => {
                if (proj.projectName === projectName) {
                    result = {
                        companyUID: identity.cert.subject.commonName,
                        companyName: companiesAsObject[identity.cert.subject.commonName].companyName, ...proj
                    };
                }
            })
            return JSON.stringify(result, null, 2);
        }
        companiesAsObject[companyUID].projects.forEach(proj => {
            if (proj.projectName === projectName) {
                result = {companyUID: companyUID, companyName: companiesAsObject[companyUID].companyName, ...proj};
            }
        })
        return JSON.stringify(result, null, 2);

    }

    async approveProject(ctx, projectName, companyUID) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== VALIDATOR_UNIT) {
            throw new Error('Current subject does not have access to this function');
        }
        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());

        let approved = false;
        companiesAsObject[companyUID].projects.forEach(proj => {
            if (proj.projectName === projectName) {
                if (proj.wallet.length === 0) {
                    return JSON.stringify({message: "Project's portfolio is empty"});
                } else {
                    let inArr = false;
                    proj.wallet.forEach((record) => {
                        if (record.currencyName === VALIDATOR_FEE_CURRENCY) {
                            if (Number(record.amount) - Number(VALIDATOR_FEE) < 0) {
                                throw new Error("Project does not possess enough USDT");
                                return JSON.stringify({message: "Project does not possess enough USDT"}, null, 2);
                            } else {
                                record.amount = Number(record.amount) - Number(VALIDATOR_FEE);
                                proj.approved = "true";
                                approved = "true";
                                proj["approvedBy"] = identity.cert.subject.commonName;
                            }
                            inArr = true;
                        }
                    })
                    if (!inArr) {
                        return JSON.stringify({message: `Project does not possess ${INVESTMENT_CURRENCY}`});
                    }
                }
            }
        })

        if (approved) {
            try {
                await this.addApprovedProject(ctx, companyUID, companiesAsObject[companyUID].companyName, projectName, ctx.stub.getTxID());
            } catch (e) {
                throw new Error("Error during adding project to validator's list!");
            }
        }

        const newRecordInBytes = Buffer.from(JSON.stringify(companiesAsObject));
        await ctx.stub.putState(COMPANIES_COLLECTION, newRecordInBytes);
        return JSON.stringify({data: ctx.stub.getTxID()}, null, 2);

    }

    async addApprovedProject(ctx, companyUID, companyName, projectName, txId) {
        const identity = new ClientIdentity(ctx.stub);
        const validatorsAsBytes = await ctx.stub.getState(VALIDATORS_COLLECTION);
        const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());
        const validator = validatorsAsObject[identity.cert.subject.commonName];
        if (!validator.approvedProjects) {
            validator.approvedProjects = [];
        }
        validator.approvedProjects.push({
            companyUID: companyUID,
            companyName: companyName,
            projectName: projectName,
            approvalDate: Date.now(),
            transactionId: txId
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
            if (!inArr) {
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
        if (identity.cert.subject.organizationalUnitName !== SYS_ADMIN) {
            throw new Error('Current subject does not have access to this function');
        }
        const investorsAsBytes = await ctx.stub.getState(INVESTORS_COLLECTION);
        const investorsAsObject = JSON.parse(investorsAsBytes.toString());

        let result = []
        Object.keys(investorsAsObject).forEach(investorKey => {
            result.push({
                investorUID: investorKey,
                investorFullName: investorsAsObject[investorKey].investorFullName
            })
        })

        return JSON.stringify(result, null, 2);
    }

    async getValidators(ctx) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== SYS_ADMIN) {
            throw new Error('Current subject does not have access to this function');
        }

        const validatorsAsBytes = await ctx.stub.getState(VALIDATORS_COLLECTION);
        const validatorsAsObject = JSON.parse(validatorsAsBytes.toString());

        let result = []


        return JSON.stringify(Object.keys(validatorsAsObject), null, 2);
    }


    async investToProject(ctx, companyUID, projectName, currency, amount) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== INVESTOR_UNIT) {
            throw new Error('Current subject does not have access to this function');
        }
        const investorUID = identity.cert.subject.commonName;

        const investorsAsBytes = await ctx.stub.getState(INVESTORS_COLLECTION);
        const investorsAsObject = JSON.parse(investorsAsBytes.toString());
        const investorFullName = investorsAsObject[investorUID].investorFullName;
        const investorWallet = investorsAsObject[investorUID].wallet;


        //withdraw investor's money
        if (investorWallet.length === 0) {
            throw new Error("Current investor's portfolio is empty");
        } else {
            let inArr = false;
            investorWallet.forEach((record) => {
                if (record.currencyName === currency) {
                    if (Number(record.amount) - Number(amount) < 0) {
                        throw new Error(`Current investor does not possess enough ${currency}`);
                    } else {
                        record.amount = Number(record.amount) - Number(amount);
                    }
                    inArr = true;
                }
            })
            if (!inArr) {
                throw new Error("Current investor does not possess this token");
            }
        }


        const projToInvestAsString = await this.getProject(ctx, projectName, companyUID);
        const projToInvest = JSON.parse(projToInvestAsString);

        const projectTokenAmount = Number(amount) / Number(projToInvest.priceInUSDT);

        //check whether its possible to withdraw this amount from project
        //write this amount to [supply]
        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());


        companiesAsObject[companyUID].projects.forEach(proj => {
            if (proj.projectName === projectName) {
                if (!proj["supply"]) {
                    proj["supply"] = 0;
                }
                if (Number(proj.totalSupply) - (Number(proj.supply) + Number(projectTokenAmount)) < 0) {
                    throw new Error("Impossible to withdraw project token, not enough!");
                } else {
                    proj.supply = Number(proj.supply) + Number(projectTokenAmount);
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
        if (!inArr) {
            investorWallet.push({
                currencyName: projToInvest.tokenName,
                amount: Number(projectTokenAmount)
            })
        }

        // deposit project
        companiesAsObject[companyUID].projects.forEach(proj => {
            if (proj.projectName === projectName) {
                if (proj.wallet.length === 0) {
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
                    if (!inArr) {
                        proj.wallet.push({
                            currencyName: currency,
                            amount: Number(amount)
                        })
                    }
                }
            }
        })

        companiesAsObject[companyUID].projects.forEach(proj => {
            if (proj.projectName === projectName) {
                if (!proj["investmentHistory"]) {
                    proj["investmentHistory"] = [];
                }
                proj["investmentHistory"].push({
                    transactionId: ctx.stub.getTxID(),
                    investorFullName: investorFullName,
                    timestamp: Date.now(),
                    currency: currency,
                    amount: amount
                })
            }
        });

        await ctx.stub.putState(INVESTORS_COLLECTION, Buffer.from(JSON.stringify(investorsAsObject)));
        await ctx.stub.putState(COMPANIES_COLLECTION, Buffer.from(JSON.stringify(companiesAsObject)));

        return JSON.stringify({investorFullName: investorFullName, companyName: companiesAsObject[companyUID].companyName, transactionId: ctx.stub.getTxID()}, null, 2);
    }

    async companyTotalInvestments(ctx) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== COMPANY_UNIT) {
            throw new Error('Current subject does not have access to this function');
        }

        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());

        let result = 0;
        companiesAsObject[identity.cert.subject.commonName].projects.forEach(pr => {
            pr.wallet.forEach(rec => {
                if (rec.currencyName === INVESTMENT_CURRENCY) {
                    result += Number(rec.amount);
                }
            })
        })


        return JSON.stringify([{currencyName: INVESTMENT_CURRENCY, amount: result}], null, 2);
    }

    async getInvestmentHistory(ctx) {
        const identity = new ClientIdentity(ctx.stub);
        if (identity.cert.subject.organizationalUnitName !== COMPANY_UNIT) {
            throw new Error('Current subject does not have access to this function');
        }

        const companiesAsBytes = await ctx.stub.getState(COMPANIES_COLLECTION);
        const companiesAsObject = JSON.parse(companiesAsBytes.toString());

        let result = [];
        companiesAsObject[identity.cert.subject.commonName].projects.forEach(pr => {
            if(!!pr.investmentHistory) {
                pr.investmentHistory.forEach(rec => {
                    result.push(rec);
                })
            }
        })

        return JSON.stringify(result, null, 2);
    }



}

module.exports = TokenizationPlatformStorage;
