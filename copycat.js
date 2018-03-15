const fs = require("fs"),
      solver = require("./node_modules/javascript-lp-solver/src/solver");

let in_file = fs.readFileSync(process.argv[2], 'utf8');
let single_rows = in_file.split('\n'),
    first_line = single_rows[0],
    first_line_el = single_rows[0].split(' '),
    R = first_line_el[0],
    C = first_line_el[1],
    F = first_line_el[2],
    N = first_line_el[3],
    B = first_line_el[4],
    T = first_line_el[5];

let ridesObj = [],
    carsObj = [];

single_rows.shift()
single_rows.splice(-1, 1)

single_rows.forEach((ride, index) => {
  ride = ride.split(' ')
  ridesObj.push({
    id: index,
    start: [ride[0], ride[1]],
    finish: [ride[2], ride[3]],
    minStart: ride[4],
    maxFinish: ride[5]
  })
})

for(let i = 0; i < F; i++) {
  carsObj.push({
    id: i,
    currCell: [0, 0],
    availableAt: 0,
    ridesDone: []
  })
}

let model,
    objFun = `max: `,
    constraintsRides = ``,
    constraintsCars = ``,
    constraintsBin = `bin `,
    lp_result,
    score = 0,
    toWrite = ``;

//LOOP nride/ncar
let structure = []

ridesObj.forEach(ride => {
  carsObj.forEach(car => {
    let time_to_arrive = Math.abs( car.currCell[0] - ride.start[0] )  + Math.abs( car.currCell[1] - ride.start[1] )
    let time_of_ride = Math.abs( ride.start[0] - ride.finish[0] ) + Math.abs( ride.start[1] - ride.finish[1] )
    if( (car.availableAt + time_to_arrive + time_of_ride) < ride.maxFinish ) {
      objFun += ((car.availableAt + time_to_arrive) <= ride.minStart) ? `+ ${time_of_ride+(+B)}v${car.id}r${ride.id} ` : `+ ${time_of_ride}v${car.id}r${ride.id} `
      //struttura[car.id] += "v${car.id}r${ride.id}"
      constraintsRides += `+ v${car.id}r${ride.id} `
      constraintsBin += `v${car.id}r${ride.id}, `

      if(!structure[car.id])
        structure[car.id] = []

      structure[car.id].push(`v${car.id}r${ride.id}`)
    }

  })

  constraintsRides += `<= 1;\n`

})

objFun += `;\n`
constraintsBin += `;`

structure.forEach(constr => {
  if(constr) {
    constraintsCars += `${constr.join(' + ')}`
    constraintsCars += ` <= 1;\n`
  }
})

console.log(objFun+constraintsRides+constraintsCars+constraintsBin);

model = solver.ReformatLP(objFun+constraintsRides+constraintsCars+constraintsBin);
lp_result = solver.Solve(model);

score += lp_result.result;

for (var key in lp_result) {
    if (lp_result.hasOwnProperty(key) && key.charAt(0) === 'v') {

        //value: lp_result[key]
    }
}

console.log(lp_result);

// console.log(lp_result);

// fs.writeFileSync(process.argv[3], toWrite);



/** Commenti
x00 = (Veicolo 0, Ride 0) // Definizione di una variabile
x00 - x01 - x02 - x03...(Quindi n_rides gruppi da n_vehicles variabili)
Quando una ride viene assegnata scompaiono n_vehicles variabili dal modello
Cioè quelle x#ride_indexi per i elemento di [vehicle1...vehicleN]
**/

/** Input file - x00 = veicolo 0, ride 0; variabili raggruppate per ride
// 2 veicoli e 3 ride

max: 6x00 + 2x10 + 2x01 + 6x11 + 2x02 + 2x12;
//Vincoli ride
x00 + x10 <= 1;
x01 + x11 <= 1;
x02 + x12 <= 1;
//Vincoli Veicoli
x00 + x01 + x02 <= 1;
x10 + x11 + x12 <= 1;

bin x00, x10, x01, x11, x02, x12;


max: + 6v0r0 + 6v1r0 + 2v0r1 + 2v1r1 + 2v0r2 + 2v1r2 ;
+ v0r0 + v1r0 <= 1;
+ v0r1 + v1r1 <= 1;
+ v0r2 + v1r2 <= 1;
v0r0 + v0r1 + v0r2 <= 1;
v1r0 + v1r1 + v1r2 <= 1;
bin v0r0, v1r0, v0r1, v1r1, v0r2, v1r2, ;
{ feasible: true,
  result: 8,
  bounded: true,
  v1r0: 1,
  v1r1: 0,
  v0r1: 1,
  v0r2: 0 }


max: x1 + 2x2 - 4x3 -3x4;
x1 + x2 <= 5;
2x1 - x2 >= 0;
-x1 + 3x2 >= 0;
x3 + x4 >= .5;
x3 >= 1.1;
x3 <= 10;

int x2, x4;

**/
