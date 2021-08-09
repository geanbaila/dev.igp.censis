/**
 * SismosController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const util = require('util');
const key = 'saludo';
const redis_fault = 0;
const w_fault = 0;




module.exports = {
	index:function(req, res){
		async function setData(value){
			var expiresIn = 1000*60*60*24;
			var ttlInSeconds = Math.ceil(expiresIn / 1000);
			return await sails.getDatastore('cache').leaseConnection(async (db)=>{
  				await (util.promisify(db.setex).bind(db))(key, ttlInSeconds, JSON.stringify(value));
			});
		}

		const callData = () => {
			return new Promise((resolve,reject)=>{
				var parametros = SismoService.last();
				setData(parametros).then(()=>{
					sails.log('TODO: datos guardados en redis');
					resolve(parametros)
				})
			});
		}

		async function getData(){
			var value = await sails.getDatastore('cache').leaseConnection(async (db)=>{
				var found = await (util.promisify(db.get).bind(db))(key);
  				if (found) {
    					return JSON.parse(found);
  				} else {
					return callData();
  				}
			});
			return value;
		}
		getData()
		.then((parametros) => {
			sails.log.debug('TODO:',parametros);
	 		return res.ok();
		})
		.catch((err)=>{
	 		return res.ok();
		})

	},

};

