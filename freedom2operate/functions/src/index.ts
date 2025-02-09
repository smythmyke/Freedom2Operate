import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { UserRecord } from "firebase-admin/auth";
import { Change } from "firebase-functions";
import { DocumentSnapshot } from "firebase-admin/firestore";

admin.initializeApp();

// When a user is created, add them to the users collection
export const createUserDocument = functions.auth.user().onCreate(async (user: UserRecord) => {
  try {
    await admin.firestore().collection("users").doc(user.uid).set({
      email: user.email || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: "user",
    });
  } catch (error) {
    console.error("Error creating user document:", error);
  }
});

// When a submission status changes, update the progress collection
export const updateProgress = functions.firestore
  .document("submissions/{submissionId}")
  .onUpdate(async (change: Change<DocumentSnapshot>, context: functions.EventContext) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (!beforeData || !afterData) {
      return;
    }

    // Only proceed if status has changed
    if (afterData.status === beforeData.status) {
      return;
    }

    try {
      await admin.firestore().collection("progress").add({
        submissionId: context.params.submissionId,
        userId: afterData.userId,
        status: afterData.status,
        currentStep: afterData.currentStep || 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        notes: afterData.notes || "",
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  });
