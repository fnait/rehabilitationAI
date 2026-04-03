import rightBiceps from "./rightBiceps";
import leftBiceps from "./leftBiceps";

import squat from "./squat";
import halfSquatRehab from "./halfSquatRehab";

import rightArmRaise from "./rightArmRaise";
import leftArmRaise from "./leftArmRaise";
import bothArmsUp from "./bothArmsUp";

import rightArmRaiseFront from "./rightArmRaiseFront";
import leftArmRaiseFront from "./leftArmRaiseFront";

import rightShoulderPress from "./rightShoulderPress";
import leftShoulderPress from "./leftShoulderPress";

import rightKneeRaise from "./rightKneeRaise";
import leftKneeRaise from "./leftKneeRaise";

import rightKneeExtension from "./rightKneeExtension";
import leftKneeExtension from "./leftKneeExtension";

import rightLegSideRaise from "./rightLegSideRaise";
import leftLegSideRaise from "./leftLegSideRaise";

import rightLegBackRaise from "./rightLegBackRaise";
import leftLegBackRaise from "./leftLegBackRaise";

import rightHipMarch from "./rightHipMarch";
import leftHipMarch from "./leftHipMarch";

import heelRaise from "./heelRaise";

import bodyBend from "./bodyBend";

import neckFlexion from "./neckFlexion";
import neckExtension from "./neckExtension";
import neckSideLeft from "./neckSideLeft";
import neckSideRight from "./neckSideRight";

// Масив усіх вправ
const exercises = [
  // руки
  rightBiceps, //1
  leftBiceps, //2
  rightArmRaise, //3
  leftArmRaise, //4
  bothArmsUp, //5
  rightArmRaiseFront, //6
  leftArmRaiseFront, //7
  rightShoulderPress, //8
  leftShoulderPress, //9

  // ноги
  squat, //10
  halfSquatRehab, //11
  rightKneeRaise, //12
  leftKneeRaise, //13
  rightKneeExtension, //14
  leftKneeExtension, //15
  rightLegSideRaise, //16
  leftLegSideRaise, //17
  rightLegBackRaise, //18
  leftLegBackRaise, //19
  rightHipMarch, //20
  leftHipMarch, //21
  heelRaise, //22

  // спина
  bodyBend, //23

  // шия
  neckFlexion, //24
  neckExtension, //25
  neckSideLeft, //26
  neckSideRight, //27
];

export default exercises;
