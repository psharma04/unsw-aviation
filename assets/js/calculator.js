/* Dataset of masses, moments, survival kit weights, and whether an aircraft has an extended baggage compartment. Only UNQ, UNY, and DXR have extended baggage, but for scalability it's easier to just keep it like this and check for whether aircraft.extBaggage is true or false.
Aircraft missing: UNG, UNI (https://github.com/psharma04/unsw-aviation/issues/9). VH-DXR's survival kit mass is an estimate.
const AIRCRAFT = [weight, moment, survivalKitWeight, externalBaggageBoolean] */
const UNF = [796.5, 1957.0, 9.0, false];
const UNH = [797.0, 1960.0, 9.0, false];
const UNJ = [800.6, 1971.0, 9.1, false];
const UNQ = [790.4, 1948.0, 8.4, true];
const UNR = [798.3, 1962.0, 9.2, false];
const UNU = [800.6, 1977.0, 9.1, false];
const UNV = [808.3, 1987.0, 9.1, false];
const UNY = [779.0, 1922.0, 9.0, true];
const RFN = [807.8, 1987.0, 9.3, false];
const CGT = [809.7, 1994.0, 8.9, false];
const DXR = [796.1, 1970.0, 9.0, true];

/* Check CG envelope limits   
If someone has a better way of doing this please let me know */
function cgCheck(CG, weight) {
  if (weight <= 980 && weight >= 780 && CG <= 2.55 && CG >= 2.40) {
    return true;
  }
  else if (weight > 980 && weight <= 1150 && CG >= 2.46 && CG <= 2.55) {
    return true;
  }
  else if (weight > 980 && weight <= 1150 && CG < 2.46 && CG >= 2.4 && weight <= ((170/0.06)*CG)-5820) {
    return true;
  } 
  else {
    return false;
  };
};

function numberOut(number) {
  return +number.toFixed(2);
}



/* Pull data from form */
document.querySelector(".query-button").addEventListener('click', () => {
    try{
        const aircraft = eval(document.querySelector('select[name="aircraft"]').value)
        
        /* Add aircraft properties extractor here */
        
        const aircraftWeight = aircraft[0]

        const aircraftMoment = aircraft[1]

        const aircraftSKWeight = aircraft[2]

        const aircraftExtBaggage = aircraft[3]

        function weightsOutput(weight, moment, querySelector, baggageParam) {
          if (baggageParam === true) {
            document.querySelector(querySelector).innerHTML = "Weight = " + numberOut(weight) + " kg<br />Moment = " + numberOut(moment) + " Nm<br />Extended Baggage Compartment? " + (aircraftExtBaggage === false ? "❌ No" : "✅ Yes");
          }
          else {
            document.querySelector(querySelector).innerHTML = "Weight = " + numberOut(weight) + " kg<br />Moment = " + numberOut(moment) +" Nm";
          };
          
        }


        /* BEW assumes full oil, so anything less than 8 must be removed from the calculation. 1qt of oil is 0.84kg. */
        const oilWeight = (((parseFloat(document.querySelector('.oilmass').value))-8)*0.84);
        
        const frontSeatWeight = parseFloat(document.querySelector('.front-seat-mass').value);
        
        const rearSeatWeight = parseFloat(document.querySelector('.rear-seat-mass').value) + aircraftSKWeight;

        const baggageWeight = parseFloat(document.querySelector('.baggage-mass').value) + 5;

        const fuelWeight = (parseFloat(document.querySelector('.fuel').value) * 2.72);

        const duration = parseFloat(document.querySelector('.duration').value);

        const fuelBurnEstimate = duration * 9.5 * 2.72;
        /* Set baggage arm based on ExtBaggage parameter */

        const baggageArm = aircraftExtBaggage === false ? 4.32 : 4.54;

        /* Weight calculations */
        const BEW = aircraftWeight + oilWeight + frontSeatWeight + rearSeatWeight + aircraftSKWeight + baggageWeight;

        const TOW = BEW + fuelWeight;

        const LDGW = TOW - fuelBurnEstimate;

        /* Moment calculations */
        const BEM = aircraftMoment + oilWeight + (frontSeatWeight*2.30) + (rearSeatWeight*3.25) + (baggageWeight*baggageArm);

        const TOM = BEM + (fuelWeight * 2.63);

        const LDGM = TOM - (fuelBurnEstimate * 2.63);

        /* Center of Gravity Check */
        const BECG = BEM/BEW;

        const TOCG = TOM/TOW;

        const LDGCG = LDGM/LDGW;

        if (cgCheck(BECG, BEW) === true) {
          document.querySelector(".cg-empty").innerHTML = "Weight = " + numberOut(BEW) + " kg<br />Moment = " + numberOut(BEM) + " Nm<br />Center of Gravity is Permissible ✅";
          }
          else {
            document.querySelector(".cg-empty").innerHTML = "Weight = " + numberOut(BEW) + " kg<br />Moment = " + numberOut(BEM) + " Nm<br />Center of Gravity is NOT Permissible ❌";
          };
          if (cgCheck(TOCG, TOW) === true) {
            document.querySelector(".cg-takeoff").innerHTML = "Weight = " + numberOut(TOW) + " kg<br />Moment = " + numberOut(TOM) + " Nm<br />Center of Gravity is Permissible ✅";
          }
          else {
            document.querySelector(".cg-takeoff").innerHTML = "Weight = " + numberOut(TOW) + " kg<br />Moment = " + numberOut(TOM) + " Nm<br />Center of Gravity is NOT Permissible ❌";
          };
          if (cgCheck(LDGCG, LDGW) === true) {
            document.querySelector(".cg-landing").innerHTML = "Weight = " + numberOut(LDGW) + " kg<br />Moment = " + numberOut(LDGM) + " Nm<br />Center of Gravity is Permissible ✅";
          }
          else {
            document.querySelector(".cg-landing").innerHTML = "Weight = " + numberOut(LDGW) + " kg<br />Moment = " + numberOut(LDGM) + " Nm<br />Center of Gravity is NOT Permissible ❌";
          };

        /* Something about auto-generating the CG envelope graphics? */

        weightsOutput(aircraftWeight, aircraftMoment, ".aircraft-output", false);
        weightsOutput(oilWeight,oilWeight,".oil-output", false);
        weightsOutput(frontSeatWeight, frontSeatWeight*2.30, ".front-seat-output", false);
        weightsOutput(rearSeatWeight, rearSeatWeight*3.25, ".rear-seat-output", false);
        weightsOutput(baggageWeight, baggageWeight*baggageArm, ".baggage-output", true);
        weightsOutput(fuelWeight, fuelWeight*2.63, ".fuel-output", false);

        var vCLFlapZero=0;
        var vCLTakeOff=0;
        var vRefFlapZero=0;
        var vRefFlapLdg=0;


        /* Takeoff/Climb speeds */
        if (TOW < 1000) {
          var coreFrac = (TOW - 850)/(1000-850)
          vCLTakeOff = coreFrac*6 + 54
          vCLFlapZero = coreFrac*8 + 60
        }
        else if (1000 <= TOW && TOW <= 1150) {
          var coreFrac = (TOW - 1000)/(1150-1000)
          vCLTakeOff = coreFrac*6 + 60
          vCLFlapZero = coreFrac*5 + 68
        }
        else if (1150 <= TOW && TOW <= 1200) {
          var coreFrac = (TOW - 1150)/(1200-1150)
          vCLTakeOff = coreFrac*1 + 66
          vCLFlapZero = coreFrac*3 + 73
        };


        document.querySelector(".v-toss").innerHTML = "V<sub>TOSS</sub> = 63 KIAS";
        document.querySelector(".v-toss-2").innerHTML = "V<sub>TOSS</sub> = 63 KIAS";
        document.querySelector(".v-cl-to").innerHTML = "V<sub>CL</sub> (Flap Take-Off) = " + numberOut(vCLTakeOff) + " KIAS"
        document.querySelector(".v-cl-f0").innerHTML = "V<sub>CL</sub> (Flap Zero) = " + numberOut(vCLFlapZero) + " KIAS"


        /* Landing/Approach speeds */
        if (LDGW < 1000) {
          var coreFrac = (LDGW - 850)/(1000-850)
          vRefFlapLdg = coreFrac*(58-63) + 58
          vRefFlapZero = coreFrac*8 + 60
        }
        else if (1000 <= LDGW && LDGW <= 1092) {
          var coreFrac = (LDGW - 1000)/(1092-1000)
          vRefFlapLdg = coreFrac*4 + 63
          vRefFlapZero = coreFrac*2 + 68
        }
        else if (1092 <= LDGW && LDGW <= 1150) {
          var coreFrac = (LDGW-1092)/(1150-1092)
          vRefFlapLdg = coreFrac*4 + 67
          vRefFlapZero = coreFrac*2 + 70
        }
        else if (1150 <= LDGW && LDGW <= 1200) {
          var coreFrac = (LDGW - 1150)/(1200-1150)
          vRefFlapLdg = coreFrac*2 + 71
          vRefFlapZero = coreFrac*3 + 73
        };

        document.querySelector(".v-ref-ldg").innerHTML = "V<sub>REF</sub> (Flap Landing) = " + numberOut(vRefFlapLdg) + " KIAS"
        document.querySelector(".v-ref-f0").innerHTML = "V<sub>REF</sub> (Flap Zero) = " + numberOut(vRefFlapZero) + " KIAS"




        











        /* Weather-dependent stuff */
        /*
        const takeoffAeroDrome = document.querySelector('.takeoff').value
        
        

        const landingAerodrome = document.querySelector('.landing').value

        var request = new XMLHttpRequest(); */

        /* Pull TAF data from AVWX REST API */
        /* Temperature and Pressure are in the remarks section, so we filter everything else out because it's not important */
        /* Switch to https://avwx.rest for production systems */

        /*
        request.open('GET', 'https://private-anon-3acd8bb613-avwx.apiary-mock.com/api/taf/' + takeoffAeroDrome + "?onfail=nearest&filter=remarks")

        request.setRequestHeader('Authorization', 'Token f3oSCgj32jAN_embTJ9FKBXWJ9y3L88aOZoIZJrKx4U');

        request.onreadystatechange = function () {
          if (this.readyState === 4) {
            console.log(this.responseText);
          }
        };

        request.send();
        */

        /* Make the results visible */
        document.querySelector(".told-output").style.display = "block";

    }
    catch(error) {
      console.log(error);
      document.querySelector(".told-output").innerHTML = "<br /><div class='alert alert-danger' role='alert'><p>Something went wrong. Please leave a comment and try again later. If the issue keeps occurring, email me at <a href='mailto:flyingops@pshar.ma'>flyingops@pshar.ma</a>.<br />Error: " + error +"</div>";
      document.querySelector(".told-output").style.display = "block";
    }

})