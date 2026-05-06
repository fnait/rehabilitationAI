import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

// Функція збереження результату одиночної вправи у Firestore
export async function saveExerciseResult({
  userId,
  userEmail,
  exerciseId,
  exerciseName,
  reps,
  seconds,
  mainAngle,
  feedback,
  warning,
}) {
  const payload = {
    userId,
    userEmail,
    exerciseId,
    exerciseName,
    reps,
    seconds,
    mainAngle,
    feedback,
    warning,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "exerciseResults"), payload);
  return docRef;
}
