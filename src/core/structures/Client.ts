import { GameFeature } from "../common/enums";

export class Client {
  features: boolean[] = [];

  constructor(public clientVersion = 0) {
    this.updateFeatures();
  }

  getClientVersion(): number {
    return this.clientVersion;
  }

  setClientVersion(version: number) {
    this.clientVersion = version;
    this.updateFeatures();
  }

  enableFeature(feature: GameFeature) {
    this.features[feature] = true;
  }

  disableFeature(feature: GameFeature) {
    this.features[feature] = false;
  }

  getFeature(feature: GameFeature): boolean {
    return this.features[feature] == true;
  }

  updateFeatures() {
    this.features = [];
    this.enableFeature(GameFeature.GameFormatCreatureName);

    if (this.clientVersion >= 770) {
      this.enableFeature(GameFeature.GameLooktypeU16);
      this.enableFeature(GameFeature.GameMessageStatements);
      this.enableFeature(GameFeature.GameLoginPacketEncryption);
    }

    if (this.clientVersion >= 780) {
      this.enableFeature(GameFeature.GamePlayerAddons);
      this.enableFeature(GameFeature.GamePlayerStamina);
      this.enableFeature(GameFeature.GameNewFluids);
      this.enableFeature(GameFeature.GameMessageLevel);
      this.enableFeature(GameFeature.GamePlayerStateU16);
      this.enableFeature(GameFeature.GameNewOutfitProtocol);
    }

    if (this.clientVersion >= 790) {
      this.enableFeature(GameFeature.GameWritableDate);
    }

    if (this.clientVersion >= 840) {
      this.enableFeature(GameFeature.GameProtocolChecksum);
      this.enableFeature(GameFeature.GameAccountNames);
      this.enableFeature(GameFeature.GameDoubleFreeCapacity);
    }

    if (this.clientVersion >= 841) {
      this.enableFeature(GameFeature.GameChallengeOnLogin);
      this.enableFeature(GameFeature.GameMessageSizeCheck);
    }

    if (this.clientVersion >= 854) {
      this.enableFeature(GameFeature.GameCreatureEmblems);
    }

    if (this.clientVersion >= 860) {
      this.enableFeature(GameFeature.GameAttackSeq);
    }

    if (this.clientVersion >= 862) {
      this.enableFeature(GameFeature.GamePenalityOnDeath);
    }

    if (this.clientVersion >= 870) {
      this.enableFeature(GameFeature.GameDoubleExperience);
      this.enableFeature(GameFeature.GamePlayerMounts);
      this.enableFeature(GameFeature.GameSpellList);
    }

    if (this.clientVersion >= 910) {
      this.enableFeature(GameFeature.GameNameOnNpcTrade);
      this.enableFeature(GameFeature.GameTotalCapacity);
      this.enableFeature(GameFeature.GameSkillsBase);
      this.enableFeature(GameFeature.GamePlayerRegenerationTime);
      this.enableFeature(GameFeature.GameChannelPlayerList);
      this.enableFeature(GameFeature.GameEnvironmentEffect);
      this.enableFeature(GameFeature.GameItemAnimationPhase);
    }

    if (this.clientVersion >= 940) {
      this.enableFeature(GameFeature.GamePlayerMarket);
    }

    if (this.clientVersion >= 953) {
      this.enableFeature(GameFeature.GamePurseSlot);
      this.enableFeature(GameFeature.GameClientPing);
    }

    if (this.clientVersion >= 960) {
      this.enableFeature(GameFeature.GameSpritesU32);
      this.enableFeature(GameFeature.GameOfflineTrainingTime);
    }

    if (this.clientVersion >= 963) {
      this.enableFeature(GameFeature.GameAdditionalVipInfo);
    }

    if (this.clientVersion >= 980) {
      this.enableFeature(GameFeature.GamePreviewState);
      this.enableFeature(GameFeature.GameClientVersion);
    }

    if (this.clientVersion >= 981) {
      this.enableFeature(GameFeature.GameLoginPending);
      this.enableFeature(GameFeature.GameNewSpeedLaw);
    }

    if (this.clientVersion >= 984) {
      this.enableFeature(GameFeature.GameContainerPagination);
      this.enableFeature(GameFeature.GameBrowseField);
    }

    if (this.clientVersion >= 1000) {
      this.enableFeature(GameFeature.GameThingMarks);
      this.enableFeature(GameFeature.GamePVPMode);
    }

    if (this.clientVersion >= 1035) {
      this.enableFeature(GameFeature.GameDoubleSkills);
      this.enableFeature(GameFeature.GameBaseSkillU16);
    }

    if (this.clientVersion >= 1036) {
      this.enableFeature(GameFeature.GameCreatureIcons);
      this.enableFeature(GameFeature.GameHideNpcNames);
    }

    if (this.clientVersion >= 1038) {
      this.enableFeature(GameFeature.GamePremiumExpiration);
    }

    if (this.clientVersion >= 1050) {
      this.enableFeature(GameFeature.GameEnhancedAnimations);
    }

    if (this.clientVersion >= 1053) {
      this.enableFeature(GameFeature.GameUnjustifiedPoints);
    }

    if (this.clientVersion >= 1054) {
      this.enableFeature(GameFeature.GameExperienceBonus);
    }

    if (this.clientVersion >= 1055) {
      this.enableFeature(GameFeature.GameDeathType);
    }

    if (this.clientVersion >= 1057) {
      this.enableFeature(GameFeature.GameIdleAnimations);
    }

    if (this.clientVersion >= 1061) {
      this.enableFeature(GameFeature.GameOGLInformation);
    }

    if (this.clientVersion >= 1071) {
      this.enableFeature(GameFeature.GameContentRevision);
    }

    if (this.clientVersion >= 1072) {
      this.enableFeature(GameFeature.GameAuthenticator);
    }

    if (this.clientVersion >= 1074) {
      this.enableFeature(GameFeature.GameSessionKey);
    }

    if (this.clientVersion >= 1080) {
      this.enableFeature(GameFeature.GameIngameStore);
    }

    if (this.clientVersion >= 1092) {
      this.enableFeature(GameFeature.GameIngameStoreServiceType);
    }

    if (this.clientVersion >= 1093) {
      this.enableFeature(GameFeature.GameIngameStoreHighlights);
    }

    if (this.clientVersion >= 1094) {
      this.enableFeature(GameFeature.GameAdditionalSkills);
    }
  }
}
