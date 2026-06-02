import fs from 'fs/promises';
import path from 'path';

const GM_MAP_FILE = path.join(process.cwd(), './scripts/gmmap.json');
const PRESETS_PATH = path.join(process.cwd(), './presets/');
const OUTPUT_FILE = path.join(PRESETS_PATH, 'catalog.json');


async function generateCatalog() {
	try {
		const files = await fs.readdir(PRESETS_PATH);
		const jsonFiles = files.filter(f => f.endsWith('.json'));

		console.log(`📊 Indexation of ${jsonFiles.length} presets...`);

		const banksMap = {};
		const categoriesMap = {};

		const mapdata = await fs.readFile(GM_MAP_FILE, 'utf-8');
		const gmmap = JSON.parse(mapdata);

		for (const file of jsonFiles) {
			if (file === 'catalog.json') continue;
			const content = await fs.readFile(path.join(PRESETS_PATH, file), 'utf-8');
			const data = JSON.parse(content);

			const programNumber = data.program || -1;
			const isDrum = data.category.toLowerCase().includes('drum');


			const catName = programNumber == -1 ? 'Percussion' : gmmap[programNumber - 1][1];
			const instrumentName = programNumber == -1 ? 'Drums' : gmmap[programNumber - 1][0];
			if (!categoriesMap[catName]) {
				categoriesMap[catName] = {
					name: data.category,
					instruments: {}
				};
			}

			if (!categoriesMap[catName].instruments[instrumentName]) {
				categoriesMap[catName].instruments[instrumentName] = {
					name: catName,
					program: programNumber,
					presets: []
				};
			}

			categoriesMap[catName].instruments[instrumentName].presets.push({
				id: data.id,
				index: data.index,
				name: data.instrument
			});

			if (programNumber > 0 && programNumber <= gmmap.length) {
				categoriesMap[catName].instruments[instrumentName].name = gmmap[programNumber - 1][0];
			}
		}

		const categories = Object.values(categoriesMap).map(cat => ({
			name: cat.name,
			instruments: Object.values(cat.instruments)
		}));

		const catalog = {
			updatedAt: new Date().toISOString(),
			categories
		};

		await fs.writeFile(OUTPUT_FILE, JSON.stringify(catalog));
		console.log(`✅ Catalog generated (${jsonFiles.length} presets)`);

	} catch (error) {
		console.error(`❌ Error: ${error.message}`);
	}
}


generateCatalog();