<script lang="ts">
	/**
	 * Codustry site footer — deployment-owned (#174 Step 2 chrome seam).
	 *
	 * Moved verbatim from the forked `(www)/+layout.svelte`; registered via
	 * `setChrome({ footer })` in `$lib/deployment/chrome.ts`.
	 */
	import * as m from '$lib/paraglide/messages';
	import { localePath, toLocale } from '$lib/i18n';
	import Logo from '$lib/marketing/Logo.svelte';
	import { homeContent } from '$lib/marketing/content';
	import type { SiteFooterProps } from '$lib/components/www/chrome';

	let { locale: rawLocale, footerNav }: SiteFooterProps = $props();

	const locale = $derived.by(() => toLocale(rawLocale));
	const home = $derived.by(() => homeContent(locale));

	// Same section list as the header — kept local so each chrome piece
	// stays self-contained.
	const sections = $derived.by(() => [
		{ label: m.nav_work(), href: localePath(locale, '/work') },
		{ label: m.nav_about(), href: localePath(locale, '/about') },
		{ label: m.nav_services(), href: localePath(locale, '/') + '#services' },
		{ label: m.nav_clients(), href: localePath(locale, '/') + '#clients' },
		{ label: m.nav_careers(), href: localePath(locale, '/careers') },
	]);

	const socials = [
		{ label: 'GitHub', href: 'https://github.com/codustry' },
		{ label: 'Facebook', href: 'https://www.facebook.com/codustry' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/company/codustry' },
	];
</script>

<footer class="border-t border-[#181C38]/10 bg-white">
	<div class="mx-auto max-w-7xl px-6 pt-16 pb-8">
		<div class="grid gap-10 md:grid-cols-12 md:gap-12">
			<!-- Brand + big email CTA -->
			<div class="md:col-span-5">
				<Logo mono class="h-6 w-auto text-[#181C38]" />
				<p class="mt-4 max-w-xs leading-relaxed text-[#181C38]/60">{m.footer_tagline()}</p>
				<a
					href={`mailto:${home.contact.email}`}
					class="display-font mt-6 inline-block text-xl font-medium underline decoration-[#5AEDC5] decoration-2 underline-offset-6 hover:decoration-4 md:text-2xl"
				>
					{home.contact.email}
				</a>
			</div>

			<!-- Explore · Connect · Visit — side by side even on mobile,
			     so the footer stays short instead of stacking three lists. -->
			<div class="grid grid-cols-3 gap-4 md:col-span-7 md:gap-8">
				<nav aria-label="Footer — explore">
					<p class="mb-4 text-xs font-medium tracking-[0.25em] text-[#181C38]/45 uppercase">
						{m.footer_explore()}
					</p>
					<ul class="flex flex-col gap-2.5 text-xs sm:text-sm">
						{#each sections as s (s.href)}
							<li>
								<a href={s.href} class="text-[#181C38]/65 hover:text-[#181C38]">{s.label}</a>
							</li>
						{/each}
						<li>
							<a href={localePath(locale, '/blog')} class="text-[#181C38]/65 hover:text-[#181C38]"
								>{m.nav_blog()}</a
							>
						</li>
						{#each footerNav as item (item.id)}
							<li>
								<a href={item.href} class="text-[#181C38]/65 hover:text-[#181C38]">{item.label}</a
								>
							</li>
						{/each}
					</ul>
				</nav>

				<nav aria-label="Footer — social">
					<p class="mb-4 text-xs font-medium tracking-[0.25em] text-[#181C38]/45 uppercase">
						{m.footer_connect()}
					</p>
					<ul class="flex flex-col gap-2.5 text-xs sm:text-sm">
						{#each socials as s (s.label)}
							<li>
								<a
									href={s.href}
									target="_blank"
									rel="noopener noreferrer"
									class="text-[#181C38]/65 hover:text-[#181C38]">{s.label}</a
								>
							</li>
						{/each}
					</ul>
				</nav>

				<div>
					<p class="mb-4 text-xs font-medium tracking-[0.25em] text-[#181C38]/45 uppercase">
						{m.footer_visit()}
					</p>
					<a
						href={home.contact.mapsUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="block text-xs leading-relaxed text-[#181C38]/65 underline decoration-[#181C38]/20 underline-offset-4 transition-colors hover:text-[#181C38] sm:text-sm"
					>
						{home.contact.address} ↗
					</a>
					<a
						href={home.contact.phoneHref}
						class="mt-3 block text-xs text-[#181C38]/65 transition-colors hover:text-[#181C38] sm:text-sm"
					>
						{home.contact.phone}
					</a>
				</div>
			</div>
		</div>

		<div
			class="mt-14 flex flex-col items-center justify-between gap-3 border-t border-[#181C38]/10 pt-6 text-xs text-[#181C38]/45 sm:flex-row"
		>
			<p>{m.footer_copyright({ year: new Date().getFullYear().toString() })}</p>
			<!-- The quiet tech flex: our platform + the AI tools that helped. -->
			<p class="text-center sm:text-right">
				<a
					href="https://github.com/codustry/khaopad"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:text-[#181C38]">{m.footer_built()} ↗</a
				>
				{m.footer_made_with()}
				<a
					href="https://claude.com"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:text-[#181C38]">Claude</a
				>
				&amp;
				<a
					href="https://higgsfield.ai"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:text-[#181C38]">Higgsfield</a
				>
			</p>
		</div>
	</div>
</footer>

<style>
	.display-font {
		font-family:
			'Space Grotesk',
			'IBM Plex Sans Thai',
			system-ui,
			sans-serif;
	}
</style>
