const fs = require('fs');
const { cplex, readCplexFromString, score } = require('./lib/gplk.util.js')

//glpk.glp_set_print_func(console.log);

let in_file = fs.readFileSync(process.argv[2], 'utf8');
let single_rows = in_file.split('\n'),
    first_line = single_rows[0],
    first_line_el = single_rows[0].split(' '),
    V = first_line_el[0],
    S = first_line_el[1],
    C = first_line_el[2],
    P = first_line_el[3];

single_rows.shift()
single_rows.splice(-1, 1)

let textModel = `Minimize
 obj: + 10 x1 + 6 x2 + 4 x3

Subject To
 p: + x3 + x2 + x1 <= 100
 q: + 5 x3 + 4 x2 + 10 x1 <= 600
 r: + 6 x3 + 2 x2 + 2 x1 <= 300

Integer
x0
x1
x2

End`

let { result, objective } = cplex(textModel)

console.log(V, S, C, P);

/*
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

}


console.log("Lo score totale è: " + score);
*/
