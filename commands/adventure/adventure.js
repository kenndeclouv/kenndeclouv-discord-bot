const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const User = require("../../database/models/userAdventure"); // Model user buat karakter
const Inventory = require("../../database/models/inventoryAdventure"); // Buat item & loot

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adventure")
    .setDescription("Mulai petualanganmu di dunia RPG!")
    .addSubcommand((subcommand) => subcommand.setName("start").setDescription("Mulai petualanganmu!"))
    .addSubcommand((subcommand) => subcommand.setName("battle").setDescription("Lawan monster di dungeon!"))
    .addSubcommand((subcommand) => subcommand.setName("stats").setDescription("Lihat stats karaktermu!"))
    .addSubcommand((subcommand) => subcommand.setName("inventory").setDescription("Cek barangmu!"))
    .addSubcommand((subcommand) => subcommand.setName("recall").setDescription("Kembali ke kota!"))
    .addSubcommand((subcommand) => subcommand.setName("shop").setDescription("Beli item di toko!"))
    .addSubcommand((subcommand) => subcommand.setName("enter-domain").setDescription("Beli item di toko!")),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    let user = await User.findOne({ where: { userId } });
    if (!user) {
      if (subcommand === "start") {
        user = await User.create({
          userId,
          level: 1,
          xp: 0,
          hp: 100,
          gold: 50,
          strength: 10,
          defense: 5,
        });
        return interaction.reply({
          content: `✨ Karaktermu berhasil dibuat! Kamu siap untuk memulai petualanganmu! 🎉`,
          ephemeral: true,
        });
      } else {
        return interaction.reply({
          content: "❌ Kamu belum punya karakter! Gunakan `/adventure start` dulu!",
          ephemeral: true,
        });
      }
    }

    if (subcommand === "start") {
      const embed = new EmbedBuilder()
        .setTitle(`> Petualanganmu dimulai!`)
        .setDescription(`🎉 Kamu siap untuk memulai petualanganmu!`)
        .setColor("Blue")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Petualanganmu dimulai dari sini!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === "stats") {
      const embed = new EmbedBuilder()
        .setTitle(`> Stats Karakter ${interaction.user.username}`)
        .setDescription(`**Level:** ${user.level}\n**XP:** ${user.xp}\n**HP:** ${user.hp}\n**Gold:** ${user.gold}\n**Strength:** ${user.strength}\n**Defense:** ${user.defense}`)
        .setColor("Blue")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Stats karaktermu!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === "inventory") {
      const inventory = await Inventory.findAll({ where: { userId } });
      if (inventory.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle(`> Inventorimu ${interaction.user.username}`)
          .setDescription("🔍 Inventorimu kosong!")
          .setColor("Blue")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: "Kamu bisa mengambil item di sini!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
      const items = inventory.map((item) => `${item.itemName}`).join("\n");
      const embed = new EmbedBuilder()
        .setTitle(`> Inventorimu ${interaction.user.username}`)
        .setDescription(`List Inventorimu:\n${items}`)
        .setColor("Blue")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Kamu bisa mengambil item di sini!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    function getRandomMonster(level) {
      let monsterList = []; // deklarasi di luar switch

      switch (level) {
        case 0:
          monsterList = [{ name: "Error Slime", hp: 1, strength: 1, goldDrop: 1, xpDrop: 1 }];
        case 1 || 2:
          monsterList = [
            { name: "Slime", hp: 10, strength: 2, goldDrop: 5, xpDrop: 3 },
            { name: "Rat", hp: 15, strength: 3, goldDrop: 7, xpDrop: 5 },
            { name: "Bat", hp: 20, strength: 4, goldDrop: 10, xpDrop: 7 },
            { name: "Zombie", hp: 30, strength: 6, goldDrop: 15, xpDrop: 10 },
            { name: "Goblin", hp: 40, strength: 7, goldDrop: 20, xpDrop: 15 },
          ];
          break;
        case 3 || 4:
          monsterList = [
            { name: "Orc", hp: 80, strength: 12, goldDrop: 25, xpDrop: 20 },
            { name: "Giant Spider", hp: 70, strength: 10, goldDrop: 20, xpDrop: 18 },
            { name: "Werewolf", hp: 100, strength: 15, goldDrop: 30, xpDrop: 25 },
            { name: "Troll", hp: 120, strength: 18, goldDrop: 40, xpDrop: 35 },
            { name: "Ent", hp: 150, strength: 20, goldDrop: 50, xpDrop: 40 },
          ];
          break;
        case 5 || 6:
          monsterList = [
            { name: "Wyvern", hp: 250, strength: 40, goldDrop: 70, xpDrop: 60 },
            { name: "Vampire", hp: 120, strength: 25, goldDrop: 35, xpDrop: 30 },
            { name: "Hydra", hp: 300, strength: 50, goldDrop: 100, xpDrop: 80 },
            { name: "Lich", hp: 180, strength: 35, goldDrop: 50, xpDrop: 45 },
            { name: "Dragon", hp: 350, strength: 60, goldDrop: 120, xpDrop: 100 },
          ];
          break;
        default:
          monsterList = [
            { name: "Behemoth", hp: 400, strength: 70, goldDrop: 150, xpDrop: 120 },
            { name: "Phoenix", hp: 350, strength: 65, goldDrop: 140, xpDrop: 110 },
            { name: "Leviathan", hp: 450, strength: 80, goldDrop: 180, xpDrop: 150 },
            { name: "Dark Sorcerer", hp: 300, strength: 75, goldDrop: 160, xpDrop: 130 },
            { name: "Colossus", hp: 500, strength: 90, goldDrop: 200, xpDrop: 180 },
          ];
          break;
      }

      return monsterList[Math.floor(Math.random() * monsterList.length)];
    }

    if (subcommand === "battle") {
      await interaction.deferReply({ ephemeral: true });

      // jika monster belum ada, buat monster baru
      if (!user.monsterName) {
        const monster = getRandomMonster(user.level);
        user.monsterName = monster.name;
        user.monsterHp = monster.hp;
        user.monsterStrength = monster.strength;
        user.monsterGoldDrop = monster.goldDrop;
        user.monsterXpDrop = monster.xpDrop;
        await user.save();
      }

      // cek inventory dengan await
      const sword = await Inventory.findOne({ where: { userId: interaction.user.id, itemName: "⚔️ Sword" } });
      const shield = await Inventory.findOne({ where: { userId: interaction.user.id, itemName: "🛡️ Shield" } });
      const armor = await Inventory.findOne({ where: { userId: interaction.user.id, itemName: "🥋 Armor" } });

      // hitung strength dan defense berdasarkan inventory
      let userStrength = user.strength + (sword ? 15 : 0);
      let userDefense = user.defense + (shield ? 10 : 0) + (armor ? 15 : 0);

      // hitung damage
      const playerDamage = Math.max(0, userStrength - Math.floor(Math.random() * 5));
      const monsterDamage = Math.max(0, user.monsterStrength - Math.floor(Math.random() * userDefense));

      // update HP user dan monster
      user.hp = Math.max(0, user.hp - monsterDamage);
      user.monsterHp = Math.max(0, user.monsterHp - playerDamage);

      await user.save(); // simpan perubahan HP

      const embed = new EmbedBuilder().setTimestamp().setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

      // jika user kalah
      if (user.hp <= 0) {
        user.hp = 50; // regenerate HP
        user.monsterName = null; // reset monster
        await user.save();
        return interaction.editReply({
          embeds: [
            embed
              .setTitle(`> Kamu kalah!`)
              .setDescription(`💀 Kamu kalah! Monster berhasil mengalahkanmu, tapi kamu bangkit lagi dengan **50 HP**.`)
              .setColor("Red")
              .setFooter({ text: "Petualanganmu belum berakhir!", iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) }),
          ],
        });
      }

      // jika monster mati
      if (user.monsterHp <= 0) {
        const goldEarned = user.monsterGoldDrop;
        const xpEarned = user.monsterXpDrop;
        const monsterName = user.monsterName; // simpan nama monster sebelum reset

        // tambah XP dan gold
        user.xp += xpEarned;
        user.gold += goldEarned;

        // reset monster
        user.monsterName = null;
        user.monsterHp = 0;
        user.monsterStrength = 0;
        user.monsterGoldDrop = 0;
        user.monsterXpDrop = 0;

        // cek level up
        if (user.xp >= user.level * 50) {
          user.level++;
          user.strength += 5;
          user.defense += 3;
          user.hp = 100;
          await user.save();
          return interaction.editReply({
            embeds: [
              embed
                .setTitle(`> Level Up!`)
                .setDescription(`🎉 Kamu naik ke level **${user.level}**! Statsmu meningkat!`)
                .setColor("Green")
                .setFooter({ text: "Teruskan petualanganmu!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }),
            ],
          });
        }

        await user.save();
        return interaction.editReply({
          embeds: [
            embed
              .setTitle(`> Kamu menang!`)
              .setDescription(`🎉 Kamu berhasil mengalahkan ${monsterName}! Kamu mendapatkan ${goldEarned} gold dan ${xpEarned} XP!`)
              .setColor("Green")
              .setFooter({ text: "Teruskan petualanganmu!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }),
          ],
        });
      }

      // default jika battle belum selesai
      return interaction.editReply({
        embeds: [
          embed
            .setTitle(`> Kamu menyerang monster`)
            .setDescription(`**${interaction.user.username}** menyerang ${user.monsterName}, memberikan ${playerDamage} damage! Tapi ${user.monsterName} menyerang balik, memberikan ${monsterDamage} damage!`)
            .setColor("Blue")
            .addFields({ name: "💖 HP Kamu", value: `${user.hp}`, inline: true })
            .addFields({ name: "👹 HP Monster", value: `${user.monsterHp}`, inline: true })
            .setFooter({ text: "Teruskan petualanganmu!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }),
        ],
      });
    }

    if (subcommand === "recall") {
      await interaction.deferReply({ ephemeral: true });
      user.hp = 100;
      user.monsterName = null;
      user.monsterHp = 0;
      user.monsterStrength = 0;
      user.monsterGoldDrop = 0;
      user.monsterXpDrop = 0;
      await user.save();
      const embed = new EmbedBuilder()
        .setTitle(`> Kamu recall!`)
        .setDescription("🏠 Kamu recall dan kembali ke kota!")
        .setColor("Blue")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Kamu kembali ke kota!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (subcommand === "shop") {
      await interaction.deferReply({ ephemeral: true });
      try {
        const user = await User.findOne({ where: { userId: interaction.user.id } });
        if (!user) {
          return interaction.editReply({ content: "kamu belum memiliki akun gunakan `/adventure start` untuk membuat akun." });
        }

        const items = [
          { name: "🛡️ Shield", price: 10, description: "Perisai yang kokoh untuk melindungi diri memberikan defense +10." },
          { name: "⚔️ Sword", price: 15, description: "Pedang yang kuat untuk bertarung melawan monster memberikan strength +10." },
          { name: "🥋 Armor", price: 30, description: "Armor yang kokoh untuk melindungi diri memberikan defense +15." },
          { name: "🍶 Revival", price: 35, description: "Menghidupkan kembali tanpa harus mati HP +100." },
        ];

        const embed = new EmbedBuilder().setColor("Blue").setTitle("> Toko").setDescription("Selamat datang di toko adventure! Pilih item yang ingin kamu beli:").setTimestamp().setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });

        items.forEach((item) => {
          embed.addFields({ name: `${item.name}`, value: `Harga: **${item.price}** gold\n${item.description}`, inline: true });
        });

        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("select_item_adventure")
            .setPlaceholder("Pilih item untuk dibeli")
            .addOptions(
              items.map((item) => ({
                label: item.name,
                description: `Harga: ${item.price} gold`,
                value: item.name.toLowerCase(),
              }))
            )
        );

        await interaction.editReply({ embeds: [embed], components: [row] });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (i) => {
          if (i.customId === "select_item_adventure") {
            await i.deferUpdate();
            const selectedItem = items.find((item) => item.name.toLowerCase() === i.values[0]);

            if (!selectedItem) return;

            if (user.gold < selectedItem.price) {
              await interaction.editReply({
                content: "kamu tidak memiliki gold yang cukup untuk membeli item ini.",
                embeds: [], // hapus embed
                components: [],
              });
              return;
            }

            const confirmRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("confirm_purchase_adventure").setLabel("Konfirmasi Pembelian").setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId("cancel_purchase_adventure").setLabel("Batal").setStyle(ButtonStyle.Danger));

            await interaction.editReply({
              content: `kamu akan membeli **${selectedItem.name}** seharga **${selectedItem.price} gold**. Konfirmasi pembelian?`,
              embeds: [], // hapus embed
              components: [confirmRow],
            });

            const confirmationFilter = (btn) => btn.user.id === interaction.user.id;
            const confirmationCollector = interaction.channel.createMessageComponentCollector({ filter: confirmationFilter, time: 15000, max: 1 });

            confirmationCollector.on("collect", async (btn) => {
              await btn.deferUpdate();
              if (btn.customId === "confirm_purchase_adventure") {
                user.gold -= selectedItem.price;
                await user.save();

                await Inventory.create({
                  userId: user.userId,
                  itemName: selectedItem.name,
                });

                await interaction.editReply({
                  content: `kamu berhasil membeli **${selectedItem.name}**!`,
                  embeds: [], // hapus embed
                  components: [],
                });
              } else if (btn.customId === "cancel_purchase_adventure") {
                await interaction.editReply({
                  content: "Pembelian dibatalkan.",
                  embeds: [], // hapus embed
                  components: [],
                });
              }
            });

            confirmationCollector.on("end", () => {
              interaction.editReply({
                components: [],
              });
            });
          }
        });

        collector.on("end", () => {
          interaction.editReply({
            content: "Waktu habis. Silakan gunakan kembali perintah `/adventure shop` untuk mengakses toko.",
            embeds: [], // hapus embed
            components: [],
          });
        });
      } catch (error) {
        console.error("Error during shop command execution:", error);
        return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
      }
    }
  },
};
