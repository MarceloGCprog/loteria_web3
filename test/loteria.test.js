const assert = require('assert');

const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const{abi,evm} = require('../compile');

let contas;
let contrato;

beforeEach( async ()=>{

    contas = await web3.eth.getAccounts();
    contrato = await new  web3.eth.Contract(abi)
                .deploy({data:evm.bytecode.object})
                .send({from:contas[0], gas:'1000000'});

});

describe("Teste Loteria:", ()=>{
    it("teste existencia", ()=>{
        assert.ok(contrato.options.address);
    });
    it("teste address gerencia", async () =>{
        var manager = await contrato.methods.manager().call();
        assert.equal(manager,contas[0]);
    });
});