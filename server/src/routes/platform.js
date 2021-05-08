import express from 'express';
import {X509WalletMixin} from 'fabric-network';
import {getCA, getConnectedWallet, sendTransaction} from '../utils';

const router = express.Router();


export const createWireframe = async () => {
    try {
        const ca = getCA();
        const adminData = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'password' });
        const mixin = X509WalletMixin.createIdentity(
            'Org1MSP',
            adminData.certificate,
            adminData.key.toBytes()
        );
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'createWireframe',
            props: []
        })
        gateway.disconnect()
        return result;
    } catch (e) {
        console.log(e);
    }
};




// ***** INVESTOR *****

export const createInvestor = async (gateway, investorFullName) => {
    try {
        const result = await sendTransaction(gateway, {
            name: 'createInvestor',
            props: [investorFullName]
        })
        gateway.disconnect()
        return result;
    } catch (e) {
        console.log(e);
    }
};

//todo For testing purposes in postman, remove before production
const getInvestorsData = async (req, res) => {
    const {certificate, privateKey} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getInvestorsData',
            props: []
        })
        gateway.disconnect()
        res.status(201).json({investors: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};

// ***** VALIDATOR *****

export const createValidator = async (gateway, validatorFullName) => {
    try {
        const result = await sendTransaction(gateway, {
            name: 'createValidator',
            props: [validatorFullName]
        })
        gateway.disconnect()
        return result;
    } catch (e) {
        console.log(e);
    }
};


//todo For testing purposes in postman, remove before production
const getValidatorsData = async (req, res) => {
    const {certificate, privateKey} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getValidatorsData',
            props: []
        })
        gateway.disconnect()
        res.status(201).json({validators: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


// ***** COMPANY *****


export const createCompany = async (gateway, companyName) => {
    try {
        const result = await sendTransaction(gateway, {
            name: 'createCompany',
            props: [companyName]
        })
        gateway.disconnect()
        return result;
    } catch (e) {
        console.log(e);
    }
};


//todo For testing purposes in postman, remove before production
const getCompaniesData = async (req, res) => {
    const {certificate, privateKey} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getCompaniesData',
            props: []
        })
        gateway.disconnect()
        res.status(201).json({companies: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};

// **********************************************


export const signInToPlatform = async (certificate, privateKey) => {
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'signInToPlatform',
            props: []
        })
        gateway.disconnect()
        return result;
    } catch (e) {
        console.log(e);
    }
};

// ************************************************8

const createNewProject = async (req, res) => {
    const {certificate, privateKey, projectName, projectDescription, emission, tokenName, priceInUSDT} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'createNewProject',
            props: [projectName, projectDescription, emission, tokenName, priceInUSDT]
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getAllProjects = async (req, res) => {
    const {certificate, privateKey} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getAllProjects',
            props: []
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};



const depositInvestor = async (req, res) => {
    const {certificate, privateKey, investorFullName, currency, amount} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'depositInvestor',
            props: [investorFullName, currency, amount]
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};

const depositCompanyProject = async (req, res) => {
    const {certificate, privateKey, companyName, projectName, currency, amount} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'depositCompanyProject',
            props: [companyName, projectName, currency, amount]
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getInvestorWallet = async (req, res) => {
    let {certificate, privateKey, investorFullName} = req.body;
    investorFullName = investorFullName || "";
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getInvestorWallet',
            props: [investorFullName]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getValidatorWallet = async (req, res) => {
    let {certificate, privateKey, validatorFullName} = req.body;
    validatorFullName = validatorFullName || ""
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getValidatorWallet',
            props: [validatorFullName]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getProjectWallet = async (req, res) => {
    let {certificate, privateKey, projectName, companyName} = req.body;
    companyName = companyName || ""
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getProjectWallet',
            props: [projectName, companyName]
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};

router.get('/getInvestorsData', getInvestorsData);
router.get('/getValidatorsData', getValidatorsData);
router.get('/getCompaniesData', getCompaniesData);

router.post('/getInvestorWallet', getInvestorWallet);
router.post('/getValidatorWallet', getValidatorWallet);
router.post('/getProjectWallet', getProjectWallet);

router.post('/createNewProject', createNewProject);
router.post('/getAllProjects', getAllProjects);

router.post('/depositInvestor', depositInvestor);
router.post('/depositCompanyProject', depositCompanyProject);

export default router;
