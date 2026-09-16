"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { IconSearch } from "@/components/ui/icons";
import { CITIES, SOLAR_CONFIG, panelCapacityForArea } from "@/lib/solar-config";
import styles from "./RoofMapPlanner.module.scss";

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export type RoofEstimate = {
  address: string;
  coordinates: [number, number][];
  roofAreaM2: number;
  panelCount: number;
  systemKwp: number;
  annualProductionKwh: number;
};

export const EMPTY_ROOF_ESTIMATE: RoofEstimate = {
  address: "",
  coordinates: [],
  roofAreaM2: 0,
  panelCount: 0,
  systemKwp: 0,
  annualProductionKwh: 0,
};

type PlaceResult = {
  id: string;
  title: string;
  subtitle: string;
  fullText: string;
  prediction: google.maps.places.PlacePrediction;
};

function normalizeCity(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();
}

function yieldForCity(city: string) {
  const normalized = normalizeCity(city);
  return CITIES.find((item) => normalized.includes(item.id))?.specificYield ?? 1600;
}

export function RoofMapPlanner({
  apiKey,
  locale,
  city,
  value,
  onChange,
}: {
  apiKey?: string;
  locale: string;
  city: string;
  value: RoofEstimate;
  onChange: (updates: Partial<RoofEstimate>) => void;
}) {
  const t = useTranslations("Contact.map");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const dataListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const onChangeRef = useRef(onChange);
  const cityRef = useRef(city);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    cityRef.current = city;
  }, [city]);

  useEffect(() => {
    const previousAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      setMapError(true);
      setMapReady(false);
    };

    return () => {
      window.gm_authFailure = previousAuthFailure;
      dataListenerRef.current?.remove();
      markerRef.current?.setMap(null);
      if (mapRef.current && window.google?.maps) {
        google.maps.event.clearInstanceListeners(mapRef.current);
      }
      dataListenerRef.current = null;
      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  function updateRoofFromFeature(feature: google.maps.Data.Feature) {
    const geometry = feature.getGeometry();
    if (!geometry || geometry.getType() !== "Polygon") return;

    const polygon = geometry as google.maps.Data.Polygon;
    const path = polygon.getAt(0).getArray();
    const roofAreaM2 = Math.max(0, google.maps.geometry.spherical.computeArea(path));
    const panelCount = panelCapacityForArea(roofAreaM2);
    const systemKwp = panelCount * SOLAR_CONFIG.panelKwp;
    const annualProductionKwh = systemKwp * yieldForCity(cityRef.current);
    const coordinates = path.map((point) => [point.lng(), point.lat()] as [number, number]);

    onChangeRef.current({
      coordinates,
      roofAreaM2,
      panelCount,
      systemKwp,
      annualProductionKwh,
    });
  }

  function initializeMap() {
    if (!apiKey || !mapContainerRef.current || mapRef.current || !window.google?.maps) return;

    try {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 38.96, lng: 35.25 },
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        tilt: 0,
      });

      map.data.setControls(null);
      map.data.setDrawingMode(null);
      map.data.setStyle({
        fillColor: "#f2a82c",
        fillOpacity: 0.28,
        strokeColor: "#f2a82c",
        strokeOpacity: 1,
        strokeWeight: 3,
      });

      dataListenerRef.current = map.data.addListener(
        "addfeature",
        ({ feature }: google.maps.Data.AddFeatureEvent) => {
          map.data.setDrawingMode(null);
          map.data.forEach((item) => {
            if (item !== feature) map.data.remove(item);
          });
          updateRoofFromFeature(feature);
          setNotice("");
        },
      );

      mapRef.current = map;
      setMapError(false);
      setMapReady(true);
    } catch {
      setMapError(true);
      setMapReady(false);
    }
  }

  function focusLocation(location: google.maps.LatLng | google.maps.LatLngLiteral, title?: string) {
    const map = mapRef.current;
    if (!map) return;

    markerRef.current?.setMap(null);
    markerRef.current = new google.maps.Marker({ map, position: location, title });
    map.setCenter(location);
    map.setZoom(19);
  }

  async function searchAddress() {
    const query = value.address.trim();
    if (!apiKey || !query) return;

    setSearching(true);
    setNotice("");
    setResults([]);

    try {
      if (!window.google?.maps?.places?.AutocompleteSuggestion) throw new Error("maps_unavailable");

      const normalizedQuery = normalizeCity(query);
      const normalizedCurrentCity = normalizeCity(city);
      const contextualQuery =
        normalizedCurrentCity && !normalizedQuery.includes(normalizedCurrentCity)
          ? `${query}, ${city}`
          : query;
      const sessionToken = new google.maps.places.AutocompleteSessionToken();
      const request = {
        includedRegionCodes: ["tr"],
        language: locale === "tr" ? "tr" : "en",
        region: "tr",
        sessionToken,
      } satisfies Omit<google.maps.places.AutocompleteRequest, "input">;
      let { suggestions } =
        await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: contextualQuery,
          ...request,
        });

      if (!suggestions.length && contextualQuery !== query) {
        ({ suggestions } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            ...request,
          }));
      }

      const nextResults = suggestions.flatMap<PlaceResult>((suggestion) => {
        const prediction = suggestion.placePrediction;
        if (!prediction) return [];

        return [
          {
            id: prediction.placeId,
            title: prediction.mainText?.text ?? prediction.text.text,
            subtitle: prediction.secondaryText?.text ?? "",
            fullText: prediction.text.text,
            prediction,
          },
        ];
      });

      if (!nextResults.length) {
        setNotice(t("searchError"));
        return;
      }

      setResults(nextResults);
    } catch {
      setNotice(t("searchError"));
    } finally {
      setSearching(false);
    }
  }

  async function selectResult(result: PlaceResult) {
    setSearching(true);
    setNotice("");

    try {
      const place = result.prediction.toPlace();
      await place.fetchFields({ fields: ["formattedAddress", "location"] });
      if (!place.location) throw new Error("missing_location");

      onChangeRef.current({ address: place.formattedAddress || result.fullText });
      focusLocation(place.location, result.title);
      setResults([]);
    } catch {
      setNotice(t("searchError"));
    } finally {
      setSearching(false);
    }
  }

  function findMyLocation() {
    if (!navigator.geolocation) {
      setNotice(t("locationError"));
      return;
    }
    setNotice("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => focusLocation({ lat: coords.latitude, lng: coords.longitude }),
      () => setNotice(t("locationError")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function clearFeatures() {
    const data = mapRef.current?.data;
    if (!data) return;
    data.setDrawingMode(null);
    data.forEach((feature) => data.remove(feature));
  }

  function resetEstimate() {
    onChangeRef.current({
      coordinates: [],
      roofAreaM2: 0,
      panelCount: 0,
      systemKwp: 0,
      annualProductionKwh: 0,
    });
  }

  function startDrawing() {
    const data = mapRef.current?.data;
    if (!data) return;

    clearFeatures();
    resetEstimate();
    data.setDrawingMode("Polygon");
    setNotice(t("drawHint"));
  }

  function clearDrawing() {
    clearFeatures();
    resetEstimate();
    setNotice("");
  }

  const numberFormat = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    maximumFractionDigits: 1,
  });
  const scriptUrl = apiKey
    ? `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&libraries=places,geometry&language=${locale === "tr" ? "tr" : "en"}&region=TR&v=weekly`
    : "";

  return (
    <section className={styles.planner} aria-labelledby="roof-map-title">
      {apiKey ? (
        <Script
          id="google-maps-platform"
          src={scriptUrl}
          strategy="afterInteractive"
          onReady={initializeMap}
          onError={() => {
            setMapError(true);
            setMapReady(false);
          }}
        />
      ) : null}

      <div className={styles.heading}>
        <div>
          <h2 id="roof-map-title" className={styles.title}>{t("title")}</h2>
          <p className={styles.intro}>{t("intro")}</p>
        </div>
        <span className={styles.optional}>{t("optional")}</span>
      </div>

      <div className={styles.searchRow}>
        <label className={styles.addressField}>
          <span className="sr-only">{t("addressLabel")}</span>
          <input
            value={value.address}
            onChange={(event) => {
              onChangeRef.current({ address: event.target.value });
              setResults([]);
              setNotice("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void searchAddress();
              }
            }}
            className={styles.addressInput}
            placeholder={t("addressPlaceholder")}
            autoComplete="street-address"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={results.length > 0}
            aria-controls="address-results"
          />
        </label>
        <button
          type="button"
          className={styles.searchButton}
          onClick={() => void searchAddress()}
          disabled={!apiKey || searching || !value.address.trim()}
          aria-label={t("search")}
        >
          <IconSearch size={20} />
          <span>{searching ? t("searching") : t("search")}</span>
        </button>
        <button
          type="button"
          className={styles.locationButton}
          onClick={findMyLocation}
          disabled={!apiKey || mapError || !mapReady}
        >
          {t("myLocation")}
        </button>
      </div>

      {results.length ? (
        <div className={styles.resultsPanel}>
          <p className={styles.resultsLabel}>{t("resultsLabel")}</p>
          <ul id="address-results" className={styles.resultsList}>
            {results.map((result) => (
              <li key={result.id}>
                <button type="button" onClick={() => void selectResult(result)}>
                  <span className={styles.resultTitle}>{result.title}</span>
                  {result.subtitle ? <span className={styles.resultSubtitle}>{result.subtitle}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {notice ? <p className={styles.notice} role="status">{notice}</p> : null}

      <div className={styles.mapShell} aria-label={t("mapLabel")}>
        {apiKey ? (
          <>
            <div ref={mapContainerRef} className={styles.map} />
            {mapError ? (
              <div className={styles.mapUnavailable} role="status">
                <strong>{t("tokenErrorTitle")}</strong>
                <p>{t("tokenErrorDesc")}</p>
              </div>
            ) : !mapReady ? (
              <div className={styles.mapLoading}>{t("loading")}</div>
            ) : null}
          </>
        ) : (
          <div className={styles.mapUnavailable}>
            <strong>{t("tokenTitle")}</strong>
            <p>{t("tokenDesc")}</p>
          </div>
        )}
      </div>

      <div className={styles.tools}>
        <button
          type="button"
          className={styles.drawButton}
          onClick={startDrawing}
          disabled={!apiKey || mapError || !mapReady}
        >
          {t("draw")}
        </button>
        <button
          type="button"
          className={styles.clearButton}
          onClick={clearDrawing}
          disabled={!value.coordinates.length}
        >
          {t("clear")}
        </button>
      </div>

      <dl className={styles.metrics} aria-label={t("estimateLabel")}>
        <div><dt>{t("roofArea")}</dt><dd>{numberFormat.format(value.roofAreaM2)} m²</dd></div>
        <div><dt>{t("panelCount")}</dt><dd>{value.panelCount}</dd></div>
        <div><dt>{t("systemPower")}</dt><dd>{numberFormat.format(value.systemKwp)} kWp</dd></div>
        <div><dt>{t("annualProduction")}</dt><dd>≈ {Math.round(value.annualProductionKwh).toLocaleString(locale)} kWh</dd></div>
      </dl>

      <p className={styles.estimateNote}>
        {t("estimateNote", {
          panelArea: numberFormat.format(SOLAR_CONFIG.panelAreaM2),
          panelPower: numberFormat.format(SOLAR_CONFIG.panelKwp),
        })}
      </p>
    </section>
  );
}
