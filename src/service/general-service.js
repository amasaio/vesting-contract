import Web3 from 'web3';

let web3 = null;
async function init()
{
    if(web3){
        return ;
    }
    web3 = new Web3(window.web3.currentProvider);
    await window.ethereum.enable();
}

async function getVar(){
    await init();
    return web3.eth.getAccounts();
}

function getWeb3(){
    return web3;
}
export const generalService = {
    init, getVar, getWeb3
};