let postHttps = function(notific,tiempoenvio, entity, options){
    let intensidad='';
    if(notific.intensidad){
      	if(notific.intensidad.intensidad == 'II' || notific.intensidad.intensidad == 'II-III' || notific.intensidad.intensidad == 'III' ||
		notific.intensidad.intensidad == 'III-IV' || notific.intensidad.intensidad == 'IV' || notific.intensidad.intensidad == 'IV-V' ||
		notific.intensidad.intensidad == 'V' || notific.intensidad.intensidad == 'V-VI' || notific.intensidad.intensidad == 'VI' ||
		notific.intensidad.intensidad == 'VI-VII' || notific.intensidad.intensidad == 'VII' || notific.intensidad.intensidad == 'VII-VIII' ||
		notific.intensidad.intensidad == 'VIII' || notific.intensidad.intensidad == 'VIII-IX' || notific.intensidad.intensidad == 'IX' ||
		notific.intensidad.intensidad == 'IX-X' || notific.intensidad.intensidad == 'X'){
	        //intensidad = `${notific.intensidad.intensidad} ${notific.referencia.split('-')[0].split('de')[1].split(',')[0]}`;
        intensidad = `${notific.intensidad.intensidad} ${notific.referencia.split(',')[0].split(/de(.+)/)[1]}`;
        }else if(notific.intensidad.intensidad == 'Sin Intensidad'){
        	intensidad = '';
      	}else{
      		//pruebas de comunicación
        	intensidad = notific.intensidad.intensidad;
      	}
    }
    //let intensidad =notific.intensidades[0];
    let clean_notific = {
        numeroReporte: notific.numeroReporte,
        fechaHoraLocal: notific.fechaHoraLocal,
        magnitud: notific.magnitud.toFixed(1),
        mensaje: notific.mensaje,
        mapaTematico: notific.mapaTematico,
        referencia: notific.referencia,
        isIn: notific.isIn,
        latitud: notific.latitud.toFixed(2),
        longitud: notific.longitud.toFixed(2),
        profundidad: notific.profundidad,
        intensidades: intensidad,
        tipoReporte: notific.tipoReporte,
        handle: notific.handle
    }
    
    let message = JSON.stringify(split_time(clean_notific));
    let data = '';
    options['headers']['Content-Type']= 'application/json';
    options['headers']['Content-Length']= Buffer.byteLength(message);
    options['json']=true;
    sails.log.debug('message',message);
return new Promise(function(resolve, reject){
        let response = {tiempoEnvio:tiempoenvio};
        let req = httpsx.request(options,(res)=>{
            res.setEncoding('utf8');
            res.on('data',(d)=>{
                data += d;
            });
            res.on('end', function(){
		sails.log.debug('data postservice.js:',res.statusCode)

                  try {
			response =(res.statusCode==200)?{'estado':'OK'}:{'estado':'refused'};
       	              response = _.merge({},JSON.parse(data),response);
                  }catch (e) {
                      reject(e);
                  }

                  UtilsService.set_notification_info(notific,entity,response);
                  let resp = {};
                  resp[entity] = response;
                  resolve(resp);
            });
        });
        req.on('error',function(err){
            if(err['errno'] == 'ECONNREFUSED'){
                response = _.merge({},{
                	estado:"refused",
                	tiempoRecepcion: new Date(),
                	reason:"Servidor inaccesible"
                },response);
            }else{
                response = _.merge({},{
                	estado:"fails",
                	tiempoRecepcion: new Date(),
                	reason:"Servidor inaccesible"
                },response);
            }
            //UtilsService.set_notification_info(notific,entity,response);
            let resp = {};
            resp[entity] = response;
            resolve(resp);
        });
        req.end(message);
    });

};

module.exports = {
  last: function(message,tiempoenvio){
    let options = {
      hostname:process.env.LAMBDA_HOST,
      port: process.env.LAMBDA_PORT,
      path: process.env.LAMBDA_PATH,
      method: 'POST',
      headers:{}
    };
    message['handle']= process.env.LAMBDA_HANDLE;
    return postHttps(message,tiempoenvio,'rimac',options);
  },
  sayHello: function sayHelloService() {
    return 'Hello I am the real Service';
  }
};


