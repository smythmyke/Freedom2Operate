"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProgress = exports.createUserDocument = void 0;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();
// When a user is created, add them to the users collection
exports.createUserDocument = functions.auth.user().onCreate(async (user) => {
    try {
        await admin.firestore().collection("users").doc(user.uid).set({
            email: user.email || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            role: "user",
        });
    }
    catch (error) {
        console.error("Error creating user document:", error);
    }
});
// When a submission status changes, update the progress collection
exports.updateProgress = functions.firestore
    .document("submissions/{submissionId}")
    .onUpdate(async (change, context) => {
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
    }
    catch (error) {
        console.error("Error updating progress:", error);
    }
});
//# sourceMappingURL=index.js.map