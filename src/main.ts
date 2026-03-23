import { Plugin, TFile, Notice } from 'obsidian';
import { StardewView, VIEW_TYPE_STARDEW } from './stardew-view';

//Save
type Pet = {
    name: string;
    specie: string;
    color: string;
}

class Save {
    public pets: Array<Pet> = new Array<Pet>();
}

//Pets
class PetItem {
    public index: number;
    public label: string;
    public description: string;

    constructor(index: number, name: string, description: string) {
        this.index = index;
        this.label = name;
        this.description = description;
    }
}

const PetSpecies: { [key: string]: string[] } = {
    Cat:        ['Black', 'Gray', 'Orange', 'White', 'Yellow', 'Purple'],
    Dog:        ['Blonde', 'Gray', 'Brown', 'Dark Brown', 'Light Brown', 'Purple'],
    Turtle:     ['Green', 'Purple'],
    Dino:       [],
    Duck:       [],
    Raccoon:    [],
    Goat:       ['Adult', 'Baby'],
    Sheep:      ['Adult', 'Baby'],
    Ostrich:    ['Adult', 'Baby'],
    Pig:        ['Adult', 'Baby'],
    Rabbit:     ['Adult', 'Baby'],
    Chicken:    ['White Adult', 'White Baby', 'Blue Adult', 'Blue Baby', 'Brown Adult', 'Brown Baby', 'Black Adult', 'Black Baby'],
    Cow:        ['White Adult', 'White Baby', 'Brown Adult', 'Brown Baby'],
    Parrot:     ['Green Adult', 'Green Baby', 'Blue Adult', 'Blue Baby', 'Golden Joja'],
    Junimo:     ['White', 'Black', 'Gray', 'Pink', 'Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Purple', 'Brown'],
}

const Names: string[] = [
    'Alex',     'Laura',
    'Raúl',     'Ángela',
    'Aitor',    'Chao',
    'Álvaro',   'Victor',
    'Rodri',    'Adri',
    'Oliva',    'Pablo',
    'Sara',     'Mar',
    'David',    'Unai',
    'Nadia',    'Miriam',
    'Irene',    'Diana',
    'Aitana',   'Lucia',
]

let save = new Save();

export default class StardewPetsPlugin extends Plugin {
    private view: StardewView | null = null;

    async onload() {
        // Load save data
        await this.loadGame();

        // Register the Stardew view
        this.registerView(VIEW_TYPE_STARDEW, (leaf) => {
            this.view = new StardewView(leaf);
            return this.view;
        });

        // Command to open Stardew view
        this.addCommand({
            id: 'open-stardew-view',
            name: 'Open Stardew Animals',
            callback: () => {
                this.app.workspace.getLeaf(true).setViewState({ type: VIEW_TYPE_STARDEW });
            }
        });

        // Command to add pet
        this.addCommand({
            id: 'add-pet',
            name: 'Add Pet',
            callback: () => {
                this.addPetCommand();
            }
        });

        // Load existing pets when view is ready
        this.app.workspace.onLayoutReady(() => {
            this.loadPets();
        });
    }

    onunload() {
        // Save game
        this.saveGame();
    }

    async loadGame() {
        const data = await this.loadData();
        if (data && data.pets) {
            save.pets = data.pets;
        }
    }

    async saveGame() {
        await this.saveData(save);
    }

    loadPets() {
        if (this.view) {
            for (const pet of save.pets) {
                this.view.spawnPet(pet.name, pet.specie, pet.color);
            }
        }
    }

    loadPet(pet: Pet) {
        if (this.view) {
            this.view.spawnPet(pet.name, pet.specie, pet.color);
        }
    }

    addPet(pet: Pet) {
        // Add to list & save
        save.pets.push(pet);
        this.saveGame();

        // Load pet in view
        this.loadPet(pet);
    }

    async addPetCommand() {
        // For simplicity, add a random chicken for now
        const specie = 'Chicken';
        const variants = PetSpecies[specie];
        if (!variants || variants.length === 0) {
            new Notice('No variants available for Chicken');
            return;
        }

        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        if (!randomVariant) {
            new Notice('Invalid variant selected');
            return;
        }

        const name = Names[Math.floor(Math.random() * Names.length)];
        if (!name) {
            new Notice('No names available');
            return;
        }

        // Parse variant
        const parts = randomVariant.split(' ');
        if (parts.length < 2) {
            new Notice('Invalid variant format');
            return;
        }

        const color = parts.slice(0, -1).join(' ').toLowerCase();
        const age = parts[parts.length - 1]?.toLowerCase();
        if (!age) {
            new Notice('Invalid age in variant');
            return;
        }

        this.addPet({ name, specie, color: `${color} ${age}` });
        new Notice(`Added ${name} the ${color} ${age} ${specie}`);
    }
}
