import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, TableList, type ColumnDefinition } from "@semio/ui";
import { TableData } from "./prebuilt/table-data";

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  title: "ui/Accordion",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof Accordion>;

interface Pokemon {
  key: string;
  name: string;
  img: string;
  types: string[];
}

const POKEMON_COLUMNS: ColumnDefinition<Pokemon>[] = [
  {
    key: "img",
    header: "",
    render: (row: Pokemon) => <img src={row.img} alt={row.name} className="h-6 aspect-square" />,
  },
  {
    key: "name",
    header: "Name",
    flex: true,
    render: (row: Pokemon) => row.name,
  },
  {
    key: "types",
    header: "Types",
    render: (row: Pokemon) => row.types.join(", "),
  },
];

// Group Pokemon by their primary type
const pokemonByType = TableData.reduce((acc: Record<string, typeof TableData>, pokemon) => {
  const primaryType = pokemon.types[0].toLowerCase() as "fire" | "water" | "grass";
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- This is incorrectly flagged
  if (!acc[primaryType]) {
    acc[primaryType] = [];
  }
  acc[primaryType].push(pokemon);
  return acc;
}, {});

export const Basic: Story = {
  args: {
    items: [
      {
        key: "section1",
        header: "Getting Started",
        content: (
          <div className="p-4 text-neutral-500">
            <p>This is the first section of the accordion.</p>
            <p>You can put any content here including text, images, or other components.</p>
          </div>
        ),
      },
      {
        key: "section2",
        header: "Advanced Features",
        content: (
          <div className="p-4 text-neutral-500">
            <p>This section contains advanced features and configurations.</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
          </div>
        ),
      },
      {
        key: "section3",
        header: "FAQ",
        content: (
          <div className="p-4 text-neutral-500">
            <p>Frequently asked questions and their answers.</p>
          </div>
        ),
      },
    ],
  },
};

export const DefaultOpen: Story = {
  args: {
    defaultOpen: true,
    items: [
      {
        key: "section1",
        header: "Always Open Section",
        content: (
          <div className="p-4 text-neutral-500">
            <p>This accordion starts with all sections open.</p>
          </div>
        ),
      },
      {
        key: "section2",
        header: "Another Section",
        content: (
          <div className="p-4 text-neutral-500">
            <p>All sections are expanded by default.</p>
          </div>
        ),
      },
    ],
  },
};

export const SinglePokemon: Story = {
  args: {
    items: TableData.slice(0, 3).map((pokemon) => ({
      key: pokemon.key,
      header: `#${pokemon.key} ${pokemon.name}`,
      content: (
        <div className="p-4 flex items-center gap-4">
          <img src={pokemon.img} alt={pokemon.name} className="h-16 w-16" />
          <div>
            <h3 className="font-semibold text-lg text-neutral-500">{pokemon.name}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Type: {pokemon.types.join(", ")}
            </p>
            <p className="text-sm text-neutral-500 mt-1">Pokédex #{pokemon.key}</p>
          </div>
        </div>
      ),
    })),
  },
};

export const PokemonWithTableList: Story = {
  args: {
    items: Object.entries(pokemonByType).map(([type, pokemon]) => ({
      key: type,
      header: `${type} Type Pokemon`,
      content: (
        <TableList
          noHeader
          data={pokemon}
          columns={POKEMON_COLUMNS}
          notFound={
            <div className="h-10 text-center flex flex-row text-neutral-500 justify-center items-center">
              No {type.toLowerCase()} type Pokemon found.
            </div>
          }
        />
      ),
    })),
  },
};

export const PokemonWithTableListDefaultOpen: Story = {
  args: {
    defaultOpen: true,
    items: Object.entries(pokemonByType).map(([type, pokemon]) => ({
      key: type,
      header: `${type} Type Pokemon (${pokemon.length.toString()})`,
      content: (
        <TableList
          noHeader
          data={pokemon}
          columns={POKEMON_COLUMNS}
          notFound={
            <div className="h-10 text-center flex flex-row text-neutral-500 justify-center items-center">
              No {type.toLowerCase()} type Pokemon found.
            </div>
          }
        />
      ),
    })),
  },
};

export const StickyHeaders: Story = {
  args: {
    defaultOpen: true,
    sticky: true,
    stickyOffset: 0,
    items: Object.entries(pokemonByType).map(([type, pokemon]) => ({
      key: type,
      header: `${type} Type`,
      content: (
        <div>
          <TableList
            noHeader
            data={pokemon}
            columns={POKEMON_COLUMNS}
            notFound={
              <div className="h-10 text-center flex flex-row text-neutral-500 justify-center items-center">
                No {type.toLowerCase()} type Pokemon found.
              </div>
            }
          />
        </div>
      ),
    })),
  },
  decorators: [
    (Story) => (
      <div className="h-96 overflow-auto border border-neutral-200 dark:border-neutral-700">
        <Story />
      </div>
    ),
  ],
};

export const StickyWithOffset: Story = {
  args: {
    defaultOpen: true,
    sticky: true,
    stickyOffset: 48,
    items: Object.entries(pokemonByType).map(([type, pokemon]) => ({
      key: type,
      header: `${type} Type`,
      content: (
        <div>
          <TableList noHeader data={pokemon} columns={POKEMON_COLUMNS} />
        </div>
      ),
    })),
  },
  decorators: [
    (Story) => (
      <div className="h-96 overflow-auto border border-neutral-200 dark:border-neutral-700">
        <div className="h-12 bg-blue-500 text-white flex items-center justify-center sticky top-0 z-10">
          Fixed Header (50px)
        </div>
        <Story />
      </div>
    ),
  ],
};
