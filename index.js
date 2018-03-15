var fs = require('fs');
var glpk = require('../dist/glpk.min.js');

let score = 0

//********** glpk library functions **********//

function saveToFile(lp, filename) {
  var fd = fs.openSync(filename, 'w');
  if (fd){
      glpk.glp_write_lp(lp, null,
          function(str){
              var buf = new Buffer(str + '\n');
              fs.writeSync(fd, buf, 0, buf.length, null);
          }
      );
      fs.closeSync(fd);
  }
}

function readCplexFromFile(lp, filename) {
  var str = fs.readFileSync(filename).toString();
  var pos = 0;
  glpk.glp_read_lp(lp, null,
      function(){
          if (pos < str.length){
              return str[pos++];
          } else
              return -1;
      }
  )
}


cplex = function(file){
  var lp = glpk.glp_create_prob();
  readCplexFromFile(lp, __dirname + "/" + file);
  var smcp = new glpk.SMCP({presolve: glpk.GLP_ON});
  glpk.glp_simplex(lp, smcp);

  var iocp = new glpk.IOCP({presolve: glpk.GLP_ON});
  glpk.glp_intopt(lp, iocp);

  score += glpk.glp_mip_obj_val(lp)

  console.log("obj: " + score);

  let result = {}, objective = glpk.glp_get_obj_val(lp);
  for(i = 1; i <= glpk.glp_get_num_cols(lp); i++){
      result[glpk.glp_get_col_name(lp, i)] = glpk.glp_get_col_prim (lp, i);
  }
  console.log(result)
};

require("repl").start("");
//glpk.glp_set_print_func(console.log);
//mathprog("todd.mod");


//********** Algorithm **********/

let in_file = fs.readFileSync(process.argv[2], 'utf8');
let single_rows = in_file.split('\n'),
    first_line = single_rows[0],
    first_line_el = single_rows[0].split(' ')

single_rows.shift()
single_rows.splice(-1, 1)

//LOOP finché c'è almeno una variabile con coefficiente > 0
while(true) {
  let structure = []
  let objFun = `Maximize\nobj: `
      constraintsBin = `\nBinary\n`

  ridesObj.forEach(ride => {
    // console.log("Ciclo: " + ride.id)
    carsObj.forEach(car => {
      let time_to_arrive = Math.abs( car.currCell[0] - ride.start[0] )  + Math.abs( car.currCell[1] - ride.start[1] )
      let time_of_ride = Math.abs( ride.start[0] - ride.finish[0] ) + Math.abs( ride.start[1] - ride.finish[1] )
      if( (car.availableAt + time_to_arrive + time_of_ride) <= ride.maxFinish ) {
        objFun += ((car.availableAt + time_to_arrive) <= ride.minStart) ? `+ ${time_of_ride+(+B)}v${car.id}r${ride.id} ` : `+ ${time_of_ride}v${car.id}r${ride.id} `
        constraintsRides += `+ v${car.id}r${ride.id} `
        constraintsBin += `v${car.id}r${ride.id} \n`

        if(!structure[car.id])
          structure[car.id] = []

        structure[car.id].push(`v${car.id}r${ride.id}`)
      }

    })

    if(constraintsRides.charAt(constraintsRides.length - 4) !== `=`) constraintsRides += ` <= 1\n`

  })

  //Condizione di stop
  if(objFun.length == 5) break;

  objFun += `\n\nSubject To\n`
  constraintsBin = constraintsBin.slice(0, constraintsBin.length - 2)
  constraintsBin += "\n\nEnd\n"

  structure.forEach(constr => {
    if(constr) {
      constraintsCars += `${constr.join(' + ')}`
      if(constraintsCars.charAt(constraintsCars.length - 4) !== `=`) constraintsCars += ` <= 1\n`
    }
  })

  //// console.log(objFun + constraintsRides + constraintsCars + constraintsBin);
  fs.writeFileSync(process.argv[3], objFun + constraintsRides + constraintsCars + constraintsBin)
  cplex(process.argv[3]);

}


console.log("Lo score totale è: " + score);