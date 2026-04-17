import { defineConfig } from "orval";

export default defineConfig({
	leaplyAdmin: {
		input: {
			target: "https://api.leaply.ai.vn/api/api-docs",
		},
		output: {
			mode: "tags-split",
			target: "./lib/generated/api/endpoints",
			schemas: "./lib/generated/api/models",
			client: "react-query",
			mock: false,
			clean: true,
			biome: false,
			override: {
				mutator: {
					path: "./lib/api/mutator.ts",
					name: "customInstance",
				},
				query: {
					useQuery: true,
					useMutation: true,
					signal: true,
					shouldExportMutatorHooks: true,
					shouldExportHttpClient: true,
				},
				zod: {
					strict: {
						response: true,
						query: true,
						param: true,
						header: true,
						body: true,
					},
					coerce: {
						response: false,
						query: true,
						param: true,
						header: true,
						body: false,
					},
					generate: {
						param: true,
						body: true,
						response: true,
						query: true,
						header: true,
					},
				},
			},
			baseUrl: "",
		},
	},
});
