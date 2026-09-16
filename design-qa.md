# Design QA - Quote roof map step

Status: Passed with one environment-specific browser limitation

## Reference

- Source: `/Users/olcayozdemir/Desktop/Screenshot 2026-09-16 at 09.59.50.png`
- Implementation: `/tr/iletisim`, step 2, checked in the in-app browser at 488 px and 1440 px widths on 2026-09-16.

## Verified

- The existing lead form now progresses from details to a dedicated roof/map step without losing the first-step values.
- The second step keeps the reference hierarchy: address search, map canvas, drawing controls, capacity metrics, consent, back, and submit.
- Mobile collapses the metric grid to two columns and keeps the address/actions usable without horizontal overflow.
- Desktop keeps the map card and contact details visually balanced.
- Back navigation and the consent validation state work.
- Address search uses Google Places and renders disambiguated results instead of moving the map to the first match automatically.
- City-qualified searches fall back to the visitor's exact query when Google has no result in that city.
- The Google Places API was verified directly with the restricted production key: `Limonluk` returns multiple labelled alternatives including district and city.
- The roof drawing uses the supported Google Maps Data layer rather than the deprecated Drawing library; polygon completion updates area, panel count, system power, annual production, and stored coordinates.
- Clearing a polygon removes its geometry and resets all estimates to zero.
- Missing or rejected map credentials produce an explicit fallback state and do not block submitting the lead without a roof drawing.
- TypeScript, targeted ESLint, translation JSON parsing, whitespace checks, and the production Webpack build pass.
- The Codex browser environment blocks Google map script domains with `ERR_BLOCKED_BY_CLIENT`, so the final satellite render and interactive polygon were not re-verified there after migrating from Mapbox. The script endpoint and Places API return successfully outside that browser layer.

## Deployment note

The public Google Maps key is stored only in the ignored local environment file. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to the deployment environment. The Cloud key is restricted to Maps JavaScript API, Places API (New), localhost, `minada.com.tr`, and its subdomains.

## Next verification

After the production environment variable is configured, repeat one address search and roof drawing on the deployed domain to verify the final satellite render and URL restriction in a normal browser.
