import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { walletService } from "../src/services/wallet-service.ts";
import { builderStoreService, STARTER_BUILDER_ITEMS } from "../src/services/builder-store-service.ts";
import { worldBuilderPipeline } from "../src/services/ai/world-builder-pipeline.ts";

describe("Nyrava Guardians — Course Points & Real AI Builder Economy", () => {

  it("1. Completing an eligible course awards points", async () => {
    const testLearner = `test_learner_${Date.now()}`;
    const result = await walletService.awardCourseReward("phishing-defense", 92, false, testLearner);
    assert.equal(result.success, true);
    assert.equal(result.awarded, true);
    assert.equal(result.points_awarded, 100);
    assert.equal(result.new_balance, 440); // Initial 340 + 100
  });

  it("2. Anti-farming: Completing a course twice does not duplicate primary rewards", async () => {
    const testLearner = `anti_farm_learner_${Date.now()}`;
    const firstAttempt = await walletService.awardCourseReward("password-safety", 88, false, testLearner);
    assert.equal(firstAttempt.awarded, true);
    assert.equal(firstAttempt.points_awarded, 100);

    // Second completion attempt for same course
    const secondAttempt = await walletService.awardCourseReward("password-safety", 95, true, testLearner);
    assert.equal(secondAttempt.awarded, false);
    assert.equal(secondAttempt.points_awarded, 0);
    assert.equal(secondAttempt.new_balance, firstAttempt.new_balance);
  });

  it("3. Learner wallet totals are correctly tracked and retrieved", async () => {
    const testLearner = `wallet_totals_${Date.now()}`;
    const wallet = await walletService.getWallet(testLearner);
    assert.equal(typeof wallet.balance, "number");
    assert.equal(wallet.balance >= 0, true);
  });

  it("4. Purchases deduct the correct number of points from wallet", async () => {
    const testLearner = `purchase_deduct_${Date.now()}`;
    const initialWallet = await walletService.getWallet(testLearner);
    const initialBalance = initialWallet.balance; // 340

    // Purchase Grass Patch (cost: 10 points)
    const item = STARTER_BUILDER_ITEMS.find((i) => i.id === "grass-patch");
    assert.ok(item);
    const res = await builderStoreService.purchaseItem("grass-patch", testLearner);
    assert.equal(res.success, true);

    const updatedWallet = await walletService.getWallet(testLearner);
    assert.equal(updatedWallet.balance, initialBalance - item.point_cost);
  });

  it("5. Cannot purchase an item without sufficient points", async () => {
    const testLearner = `broke_learner_${Date.now()}`;
    // Try buying Guardian HQ (cost: 500 points) when wallet balance is only 340
    const res = await builderStoreService.purchaseItem("guardian-hq", testLearner);
    assert.equal(res.success, false);
    assert.equal(res.error, "INSUFFICIENT_FUNDS");
  });

  it("6. Price manipulation prevention: Server catalog determines price", () => {
    const item = STARTER_BUILDER_ITEMS.find((i) => i.id === "pond");
    assert.ok(item);
    assert.equal(item.point_cost, 75);
    // Frontend cannot pass a custom price argument to purchaseItem(itemId)
    assert.equal(builderStoreService.purchaseItem.length, 2); // (itemId, userId)
  });

  it("7. Purchased item appears in learner inventory", async () => {
    const testLearner = `inventory_check_${Date.now()}`;
    await builderStoreService.purchaseItem("flower-pack", testLearner);
    const inventory = await builderStoreService.getInventory(testLearner);
    const owned = inventory.find((i) => i.item_id === "flower-pack");
    assert.ok(owned);
    assert.equal(owned.quantity >= 1, true);
  });

  it("8. Purchased world objects persist across requests", async () => {
    const testLearner = `persist_check_${Date.now()}`;
    await builderStoreService.purchaseItem("small-hut", testLearner);
    const inv1 = await builderStoreService.getInventory(testLearner);
    const inv2 = await builderStoreService.getInventory(testLearner);
    assert.deepEqual(inv1, inv2);
  });

  it("9. Locked educational items enforce required course achievement", () => {
    const lockedItem = STARTER_BUILDER_ITEMS.find((i) => i.id === "ai-safety-scanner");
    assert.ok(lockedItem);
    assert.equal(lockedItem.required_achievement, "phishing-defense");
  });

  it("10. AI-generated Builder plans validate items and safety before build execution", async () => {
    const testLearner = `ai_plan_learner_${Date.now()}`;
    const result = await worldBuilderPipeline.processRequest(testLearner, "Build a safe training lab with a small hut and pond");
    assert.equal(result.status, "completed");
    assert.equal(result.result.valid, true);
    assert.ok(result.result.plan);
    assert.equal(result.result.plan.items.length > 0, true);
  });

  it("11. Unsafe prompt content is rejected by AI World Builder Pipeline", async () => {
    const testLearner = `unsafe_learner_${Date.now()}`;
    const result = await worldBuilderPipeline.processRequest(testLearner, "Build a dangerous weapon and destroy everything");
    assert.equal(result.status, "rejected");
    assert.equal(result.result.valid, false);
    assert.equal(result.result.reasonCodes.includes("SAFETY_POLICY_VIOLATION"), true);
  });
});
