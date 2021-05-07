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



router.get('/getInvestorsData', getInvestorsData);
router.get('/getValidatorsData', getValidatorsData);
router.get('/getCompaniesData', getCompaniesData);

export default router;
