const fs = require('fs');
const glpk = require('./glpk.min.js');

let score = 0

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

// function readCplexFromFile(lp, file) {
//   var str = fs.readFileSync(file).toString();
//   var pos = 0;
//   glpk.glp_read_lp(lp, null,
//       function(){
//           if (pos < str.length){
//               return str[pos++];
//           } else
//               return -1;
//       }
//   )
// }

function readCplexFromString(lp, str) {
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


function cplex(data){
  var lp = glpk.glp_create_prob();
  // readCplexFromFile(lp, data);
  readCplexFromString(lp, data);
  var smcp = new glpk.SMCP({presolve: glpk.GLP_ON});
  glpk.glp_simplex(lp, smcp);

  var iocp = new glpk.IOCP({presolve: glpk.GLP_ON});
  glpk.glp_intopt(lp, iocp);

  score += glpk.glp_mip_obj_val(lp)

  // console.log("obj: " + score);

  let result = {}, objective = glpk.glp_get_obj_val(lp);
  for(i = 1; i <= glpk.glp_get_num_cols(lp); i++){
      result[glpk.glp_get_col_name(lp, i)] = glpk.glp_get_col_prim (lp, i);
  }
  // console.log(result)

  return {result, objective}
};


module.exports.readCplexFromString = readCplexFromString;
module.exports.cplex = cplex;
