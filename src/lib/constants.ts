export const SEVERITY_LABELS = {
	low: "Low",
	moderate: "Moderate",
	high: "High",
} as const;

export const SEVERITY_COLORS = {
	low: "var(--severity-low)",
	moderate: "var(--severity-moderate)",
	high: "var(--severity-high)",
} as const;

export const PHYSICAL_REFERENCE_OPTIONS = [
	{ value: "ankle_deep", label: "Ankle Deep", textDefault: "Ankle deep" },
	{ value: "calf_deep", label: "Calf Deep", textDefault: "Calf deep" },
	{ value: "knee_deep", label: "Knee Deep", textDefault: "Knee deep" },
	{ value: "waist_deep", label: "Waist Deep", textDefault: "Waist deep" },
	{ value: "chest_deep", label: "Chest Deep", textDefault: "Chest deep" },
	{ value: "neck_deep", label: "Neck Deep", textDefault: "Neck deep" },
	{ value: "head_deep", label: "Head Deep", textDefault: "Above head level" },
	{ value: "roof_level", label: "Roof Level", textDefault: "Roof level" },
] as const;

export const MOBILITY_IMPACT_OPTIONS = [
	{
		value: "passable",
		label: "Passable",
		textDefault: "Passable to all types of vehicles",
	},
	{
		value: "traverse_with_caution",
		label: "Traverse with Caution",
		textDefault: "Traverse with caution",
	},
	{
		value: "small_cars_have_difficulty",
		label: "Small Cars Have Difficulty",
		textDefault: "Small cars and motorcycles have difficulty passing",
	},
	{
		value: "passable_large_vehicles_only",
		label: "Large Vehicles Only",
		textDefault: "Passable for large vehicles only",
	},
	{
		value: "impassable",
		label: "Impassable",
		textDefault: "Not passable to all types of vehicles",
	},
] as const;

export const DAVAO_DISTRICTS = [
	"Agdao",
	"Baguio",
	"Buhangin",
	"Bunawan",
	"Calinan",
	"Marilog",
	"Paquibato",
	"Poblacion",
	"Talomo",
	"Toril",
	"Tugbok",
] as const;

export const MODEL_LABEL_MAP = {
	0: "low",
	1: "moderate",
	2: "high",
} as const;
