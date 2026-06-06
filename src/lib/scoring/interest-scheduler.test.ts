import { subDays } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  getInterestMilestones,
  shouldGenerateMilestoneInterest,
  type IdeaForInterestSchedule
} from "@/lib/scoring/interest-scheduler";

function idea(days: number, overrides: Partial<IdeaForInterestSchedule> = {}): IdeaForInterestSchedule {
  return {
    id: "idea-1",
    title: "测试灵感",
    createdAt: subDays(new Date(), days),
    status: "incubating",
    archivedAt: null,
    ...overrides
  };
}

describe("interest scheduler", () => {
  it("does not trigger before 7 days", () => {
    expect(getInterestMilestones(idea(6))).toEqual([]);
  });

  it("triggers 7d milestone", () => {
    expect(shouldGenerateMilestoneInterest(idea(7), [])).toEqual(["7d"]);
  });

  it("does not duplicate existing 7d interest", () => {
    expect(
      shouldGenerateMilestoneInterest(idea(10), [
        { milestone: "7d", interestType: "7 天初步复盘", daysSinceCreated: 7 }
      ])
    ).toEqual([]);
  });

  it("triggers 30d milestone", () => {
    expect(
      shouldGenerateMilestoneInterest(idea(30), [
        { milestone: "7d", interestType: "7 天初步复盘", daysSinceCreated: 7 }
      ])
    ).toEqual(["30d"]);
  });

  it("triggers 90d milestone", () => {
    expect(
      shouldGenerateMilestoneInterest(idea(90), [
        { milestone: "7d", interestType: "7 天初步复盘", daysSinceCreated: 7 },
        { milestone: "30d", interestType: "30 天升级", daysSinceCreated: 30 }
      ])
    ).toEqual(["90d"]);
  });

  it("skips archived ideas", () => {
    expect(getInterestMilestones(idea(90, { status: "archived", archivedAt: new Date() }))).toEqual([]);
  });

  it("skips converted ideas by default", () => {
    expect(getInterestMilestones(idea(90, { status: "converted" }))).toEqual([]);
  });
});
