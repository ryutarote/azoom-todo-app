export default defineNuxtConfig({
	modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxt/eslint'],
	typescript: {
		strict: true,
	},
	eslint: {
		config: {
			stylistic: true,
		},
	},
	ssr: false,
});
