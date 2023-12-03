export default class ItemProperties {
  constructor() {
    this.appendProperties();
  }

  bindHooks() {
    // Append Properties on `setup` Hook to make sure we are after all official modules
    // Hooks.on("setup", this.appendProperties.bind(this));
    Hooks.on("wfrp4e:applyDamage", this.onApplyDamage.bind(this));
  }

  appendProperties() {
    const config = {};

    config.weaponQualities = {
      slashing: 'Forien.Armoury.Arrows.Properties.Slashing.Label',
      incendiary: 'Forien.Armoury.Arrows.Properties.Incendiary.Label',
      blinding: 'Forien.Armoury.Arrows.Properties.Blinding.Label',
      recoverable: 'Forien.Armoury.Arrows.Properties.Recoverable.Label',
    };

    config.weaponFlaws = {
      unrecoverable: 'Forien.Armoury.Arrows.Properties.Unrecoverable.Label',
    };

    config.propertyHasValue = {
      slashing: true,
      blinding: true,
      incendiary: false,
      recoverable: false,
      unrecoverable: false,
    };

    config.qualityDescriptions = {
      slashing: 'Forien.Armoury.Arrows.Properties.Slashing.Description',
      incendiary: 'Forien.Armoury.Arrows.Properties.Incendiary.Description',
      blinding: 'Forien.Armoury.Arrows.Properties.Blinding.Description',
      recoverable: 'Forien.Armoury.Arrows.Properties.Recoverable.Description',
    };

    config.flawDescriptions = {
      unrecoverable: 'Forien.Armoury.Arrows.Properties.Unrecoverable.Description',
    };

    foundry.utils.mergeObject(game.wfrp4e.config, config)
  }

  onApplyDamage(args) {
    const {
      actor,
      opposedTest,
      totalWoundLoss,
      AP,
      damageType,
      updateMsg,
      messageElements,
      attacker,
      extraMessages
    } = args;

    this.#checkForSlashing(opposedTest, AP, actor, extraMessages);
    this.#checkForIncendiary(opposedTest, actor, extraMessages);
    this.#checkForBlinding(opposedTest, actor, extraMessages);
  }

  #checkForBlinding(opposedTest, actor, extraMessages) {
    const blinding = opposedTest.attackerTest.weapon?.properties.qualities.blinding?.value ?? null;
    if (blinding === null) return;

    actor.addCondition("blinded", blinding);
    extraMessages.push(game.i18n.format("Forien.Armoury.Arrows.Properties.Blinding.Message", {rating: blinding}));
  }

  #checkForIncendiary(opposedTest, actor, extraMessages) {
    const incendiary = opposedTest.attackerTest.weapon?.properties.qualities.incendiary ?? null;
    if (incendiary === null) return;
    if (!opposedTest.attackerTest.result.critical) return;

    actor.addCondition("ablaze");
    extraMessages.push(game.i18n.localize("Forien.Armoury.Arrows.Properties.Incendiary.Message"));
  }

  #checkForSlashing(opposedTest, AP, actor, extraMessages) {
    const slashing = opposedTest.attackerTest.weapon?.properties.qualities.slashing?.value ?? null;
    if (slashing === null) return;
    if (slashing < AP.used) return;

    actor.addCondition('bleeding');
    extraMessages.push(game.i18n.format("Forien.Armoury.Arrows.Properties.Slashing.Message", {
      location: AP.label,
      ap: AP.used,
      rating: slashing
    }));
  }
}