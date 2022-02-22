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

    it("teste entrada", async ()=>{
        await contrato.methods.enterGame().send({
            from: contas[1],
            value: web3.utils.toWei('0.002','ether')});
        
        var player0 = await contrato.methods.getPlayers().call();
        assert.equal(player0[0],contas[1]); //Equal comparar se sao objetos iguais, não valores iguais!

    });

    it("teste multiplas entradas", async ()=>{
        await contrato.methods.enterGame().send({
            from: contas[1],
            value: web3.utils.toWei('0.002','ether')});
        await contrato.methods.enterGame().send({
            from: contas[2],
            value: web3.utils.toWei('0.002','ether')});
        await contrato.methods.enterGame().send({
            from: contas[3],
            value: web3.utils.toWei('0.002','ether')});
        
        var players = await contrato.methods.getPlayers().call();
        var contas_teste = [contas[1],contas[2],contas[3]];
        assert.deepEqual(players,contas_teste); //Usar deepEqual para comparar valores e nao se eh o msm objeto!!

    });

    it("Teste entrar sem pagar",async ()=>{
        try{
            await contrato.methods.enterGame().send({
            from: contas[1],
            value: web3.utils.toWei('0.0001','ether')});
        }catch(err){
            assert.ok(err);
        }
    });
    
    it("Teste funcao WinnerPicker conta manager", async ()=>{

        await contrato.methods.enterGame().send({
            from: contas[1],
            value: web3.utils.toWei('0.002','ether')});
        await contrato.methods.enterGame().send({
            from: contas[2],
            value: web3.utils.toWei('0.002','ether')});
        await contrato.methods.enterGame().send({
            from: contas[3],
            value: web3.utils.toWei('0.002','ether')});
        
        var manager = await contrato.methods.manager().call();
        
        await contrato.methods.winnerPick().send({
                from: manager
            });
        
        var players = await contrato.methods.getPlayers().call();
        assert.deepEqual(players.length,0);


    });

    it("Teste funcao WinnerPicker outra conta",async ()=>{
        try{
            await contrato.methods.winnerPick().send({
                from: contas[1]
            });
        }
        catch(err){
            assert.ok(err);
        }
    });

    it("Teste Envio Premio", async () =>{     
        
        var manager = await contrato.methods.manager().call();

        await contrato.methods.enterGame().send({
                from: manager,
                value: web3.utils.toWei('2','ether')});
        
        const initialBalance = await web3.eth.getBalance(manager);

        await contrato.methods.winnerPick().send({
            from: manager
        });

        const finalBalance = await web3.eth.getBalance(manager);

        const diference = finalBalance - initialBalance;

        assert(diference > web3.utils.toWei('1.8','ether'));
        
    });
});