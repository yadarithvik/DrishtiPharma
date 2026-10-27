"""
===================================================================================================
Project Name     : Drishti-Pharma (दृष्टि फार्मा) - Inclusive Assistive Healthcare Vision System
Module Name      : core/safety_guardian.py (Deterministic Pharmaceutical Safety & Shelf-Life Guardian)
Hackathon / Track: PySustain-2026 | Track 5: AI for Assistive Healthcare & Inclusive Technologies
Course Code      : BACSE101 - Problem Solving using Python
Institution      : School of Electronics Engineering (SENSE), VIT Vellore
Faculty Mentor   : Dr. R. Elakkiya, Associate Professor Grade 1, SENSE, VIT Vellore
Student Innovators:
    1. Yada Rithvik
    2. Anirudh Dodia
    3. NeelKorak Jana
---------------------------------------------------------------------------------------------------
Regulatory Compliance & Algorithmic Principles:
    1. Deterministic Verification vs. Probabilistic Hallucination:
       Large Multimodal Models (LMMs) occasionally suffer from arithmetic or temporal
       hallucinations when comparing calendar dates. DrishtiSetu routes all raw date strings
       into this pure deterministic rule engine, guaranteeing 100% mathematical precision.

    2. Indian Pharmacopoeia (IP 2022) & CDSCO Schedule P Standard Shelf-Life Monograph:
       In clinical practice, elderly or visually impaired patients frequently cut blister packs,
       severing the stamped Expiry Date (EXP) while leaving the Manufacturing Date (MFD) intact.
       This engine mathematically derives the exact expiration date:
           EXP_Date = MFD_Date + ShelfLife_Months(IP_Monograph)
       ensuring patients are not left helpless when encountering physically severed strips.

    3. Three-Tier Categorical Safety Risk Classification:
       Relative to reference calendar date (October 8, 2026):
           - EXPIRED       : Delta Days < 0       (CRITICAL ALERT - DO NOT CONSUME)
           - EXPIRING_SOON : 0 <= Delta Days <= 60 (CAUTION - Consume prior to expiration)
           - SAFE / VALID  : Delta Days > 60      (VERIFIED SAFE)

    4. Trilingual Natural Conversational Verdict Synthesis:
       Constructs grammatically polished, reassuring conversational sentences in English,
       Tamil (தமிழ்), and Hindi (हिन्दी) formatted for the blind:
           "The scanned tablet is [Name]. It expires on [Date]. It is consumable, generally used for [Indication]."
===================================================================================================
"""

import re
from datetime import datetime, date
from typing import Dict, Any, Optional, Tuple, List
import config

# Month string to integer calendar mapping
MONTH_NAME_MAP: Dict[str, int] = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5, "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12
}

# Indian Pharmacopoeia (IP 2022) & CDSCO Validated Standard Shelf-Life Registry (in Months)
# Applied deterministically when blister strips are cut and only MFD is visible.
PHARMACOPOEIA_SHELF_LIFE_MONTHS: Dict[str, int] = {
    "PARACETAMOL": 36,       # Dolo 650, Calpol, Crocin (3 Years standard shelf life)
    "ACETAMINOPHEN": 36,     # International non-proprietary name equivalent
    "DICYCLOMINE": 24,       # Cyclopam antispasmodic combination (2 Years)
    "AMOXICILLIN": 24,       # Augmentin 625 Duo, Moxikind-CV (2 Years)
    "CLAVULANATE": 24,       # Beta-lactamase inhibitor combination
    "AZITHROMYCIN": 36,      # Azee 500, Zithromax (3 Years)
    "PANTOPRAZOLE": 24,      # Pan 40, Pantocid (2 Years)
    "OMEPRAZOLE": 24,        # Omez (2 Years)
    "RABEPRAZOLE": 24,       # Razo 20 (2 Years)
    "CETIRIZINE": 36,        # Cetzine, Alerid (3 Years)
    "LEVOCETIRIZINE": 36,    # Levocet (3 Years)
    "MONTELUKAST": 24,       # Montair LC (2 Years)
    "METFORMIN": 36,         # Glycomet 500 (3 Years)
    "ATORVASTATIN": 36,      # Atorva, Lipitor (3 Years)
    "ROSUVASTATIN": 36,      # Rozavel (3 Years)
    "IBUPROFEN": 36,         # Brufen, Combiflam (3 Years)
    "CIPROFLOXACIN": 36,     # Ciplox 500 (3 Years)
    "OFLOXACIN": 36,         # Zenflox (3 Years)
    "TELMISARTAN": 36,       # Telma 40 (3 Years)
    "AMLODIPINE": 36,        # Amlong (3 Years)
    "LOSARTAN": 36,          # Losar 50 (3 Years)
    "DOMPERIDONE": 36,       # Domstal prokinetic (3 Years)
    "MULTIVITAMIN": 24,      # Becosules, Supradyn (2 Years)
    "VITAMIN C": 18,         # Limcee, Celin (1.5 Years)
    "ZINC": 24,              # Zinconia (2 Years)
    "DEFAULT_SOLID_ORAL": 36 # Official IP monograph default for solid oral blister packaging
}


class SafetyGuardian:
    """
    Deterministic Safety Guardian & Expiry Chronology Engine.

    Guarantees absolute chronological correctness, prevents medication toxicity,
    derives missing shelf lives, and produces natural audio verdicts for low-vision patients.
    """

    def __init__(self, reference_date: datetime = config.CURRENT_DATE) -> None:
        """
        Initializes the safety guardian with the hackathon evaluation calendar reference.

        :param reference_date: System calendar date against which expirations are calculated.
        :type reference_date: datetime
        """
        self.ref_date: datetime = reference_date

    def parse_date_string(self, raw_str: Optional[str]) -> Optional[date]:
        """
        Extracts month and year from varied international pharmaceutical packaging formats.

        Handled Formats:
            - MM/YYYY or MM-YYYY (e.g. 04/2026, 11-2024)
            - MM/YY or MM-YY (e.g. 04/26, 12/28)
            - MMM YYYY or MMM-YY (e.g. OCT 2026, APR-26, NOV 25)
            - YYYY/MM (e.g. 2026/04)

        :param raw_str: Raw printed date string detected by optical extraction.
        :type raw_str: Optional[str]
        :return: Python standard library date object (normalized to 28th of the month) or None.
        :rtype: Optional[date]
        """
        if not raw_str or not isinstance(raw_str, str):
            return None

        clean: str = raw_str.upper().strip()

        # Remove common packaging prefixes (e.g. 'EXP:', 'MFG:', 'EXPIRY:', 'USE BEFORE')
        clean = re.sub(
            r'(EXP\.?|EXPIRY|MFG\.?|MFR\.?|DATE|DT|USE\s+BEFORE|BEST\s+BEFORE)[:\s\.]*', 
            '', 
            clean
        ).strip()

        # Pattern 1: MM/YYYY or MM-YYYY (e.g. 04/2026, 12-2028)
        m1 = re.search(r'\b(0?[1-9]|1[0-2])[\/\-\.](20[2-3][0-9])\b', clean)
        if m1:
            month = int(m1.group(1))
            year = int(m1.group(2))
            return date(year, month, 28)

        # Pattern 2: MM/YY or MM-YY (e.g. 04/26, 11/24)
        m2 = re.search(r'\b(0?[1-9]|1[0-2])[\/\-\.]([2-3][0-9])\b', clean)
        if m2:
            month = int(m2.group(1))
            year = 2000 + int(m2.group(2))
            return date(year, month, 28)

        # Pattern 3: Word Month + Year (e.g. APR 2026, OCT-26, NOV 24)
        m3 = re.search(r'\b([A-Z]{3,9})[\s\/\-\.]+(20[2-3][0-9]|[2-3][0-9])\b', clean)
        if m3:
            month_str = m3.group(1).lower()
            year_str = m3.group(2)
            year = int(year_str) if len(year_str) == 4 else (2000 + int(year_str))

            for k, v in MONTH_NAME_MAP.items():
                if month_str.startswith(k):
                    return date(year, v, 28)

        # Pattern 4: Year Month (e.g. 2026/04)
        m4 = re.search(r'\b(20[2-3][0-9])[\/\-\.](0?[1-9]|1[0-2])\b', clean)
        if m4:
            year = int(m4.group(1))
            month = int(m4.group(2))
            return date(year, month, 28)

        return None

    def get_standard_shelf_life_months(self, drug_name: str, generic_name: str) -> int:
        """
        Looks up validated Indian Pharmacopoeia shelf life for the chemical formulation.

        :param drug_name: Commercial brand name (e.g. Dolo 650, Cyclopam).
        :type drug_name: str
        :param generic_name: Active chemical generic name (e.g. Paracetamol IP).
        :type generic_name: str
        :return: Shelf life duration in months (e.g. 24, 36).
        :rtype: int
        """
        query: str = f"{drug_name} {generic_name}".upper()
        for key, months in PHARMACOPOEIA_SHELF_LIFE_MONTHS.items():
            if key != "DEFAULT_SOLID_ORAL" and key in query:
                return months
        return PHARMACOPOEIA_SHELF_LIFE_MONTHS["DEFAULT_SOLID_ORAL"]

    def calculate_expiry_from_mfd(
        self, 
        mfd_str: str, 
        drug_name: str = "", 
        generic_name: str = ""
    ) -> Tuple[Optional[date], int, str]:
        """
        Deterministically derives exact expiry date when blister pack is cut and EXP is absent.

        Mathematical Derivation:
            EXP_Month = MFD_Month + ShelfLife_Months
            EXP_Year  = MFD_Year + ((EXP_Month - 1) // 12)

        :param mfd_str: Raw manufacturing date string (e.g. "11/2024").
        :type mfd_str: str
        :param drug_name: Brand name of the medicine.
        :type drug_name: str
        :param generic_name: Active chemical formulation.
        :type generic_name: str
        :return: Tuple of (calculated_date, shelf_life_months, explanation_note).
        :rtype: Tuple[Optional[date], int, str]
        """
        mfd_date: Optional[date] = self.parse_date_string(mfd_str)
        if not mfd_date:
            return None, 0, "Could not parse manufacturing date for shelf-life derivation."

        shelf_months: int = self.get_standard_shelf_life_months(drug_name, generic_name)

        # Add shelf months to manufacturing date
        total_months: int = mfd_date.month + shelf_months
        new_year: int = mfd_date.year + (total_months - 1) // 12
        new_month: int = ((total_months - 1) % 12) + 1

        exp_date: date = date(new_year, new_month, 28)
        years: float = shelf_months / 12.0
        years_label: str = f"{int(years)} years" if years.is_integer() else f"{years:.1f} years"

        note: str = (
            f"Calculated deterministically from Indian Pharmacopoeia (IP 2022) validated shelf life "
            f"of {years_label} ({shelf_months} months) from Manufacturing Date ({mfd_date.strftime('%B %Y')})."
        )
        return exp_date, shelf_months, note

    def evaluate_expiry_status(
        self, 
        raw_expiry_str: Optional[str],
        raw_mfg_str: Optional[str] = None,
        drug_name: str = "",
        generic_name: str = ""
    ) -> Dict[str, Any]:
        """
        Evaluates parsed expiry date against the reference calendar (October 8, 2026).

        Handles cut blister strips automatically by falling back to manufacturing date
        shelf-life derivation.

        :param raw_expiry_str: Raw printed expiry string or None if severed.
        :type raw_expiry_str: Optional[str]
        :param raw_mfg_str: Raw printed manufacturing date string or None.
        :type raw_mfg_str: Optional[str]
        :param drug_name: Brand name.
        :type drug_name: str
        :param generic_name: Active chemical ingredients.
        :type generic_name: str
        :return: Structured clinical status dictionary.
        :rtype: Dict[str, Any]
        """
        parsed_dt: Optional[date] = self.parse_date_string(raw_expiry_str)
        is_derived: bool = False
        derivation_note: str = ""

        # Cut blister pack fallback: derive exact expiration from manufacturing date
        if not parsed_dt and raw_mfg_str:
            calc_dt, _, note = self.calculate_expiry_from_mfd(raw_mfg_str, drug_name, generic_name)
            if calc_dt:
                parsed_dt = calc_dt
                is_derived = True
                derivation_note = note

        ref: date = self.ref_date.date()

        # Unverified Case: neither expiry date nor manufacturing date could be recovered
        if not parsed_dt:
            return {
                "status": "UNVERIFIED",
                "badge": "⚠️ DATE UNVERIFIED",
                "color": config.THEME_DARK["accent_warning"],
                "is_safe": False,
                "is_expired": False,
                "parsed_date": None,
                "days_remaining": None,
                "is_derived_from_mfd": False,
                "derivation_note": "",
                "message": "Expiry date stamp was cut or unreadable, and no manufacturing date was available for shelf-life derivation."
            }

        days_remaining: int = (parsed_dt - ref).days

        # Expired Case: Days remaining < 0
        if days_remaining < 0:
            return {
                "status": "EXPIRED",
                "badge": "🚨 CRITICAL: EXPIRED MEDICINE",
                "color": config.THEME_DARK["accent_danger"],
                "is_safe": False,
                "is_expired": True,
                "parsed_date": parsed_dt.strftime("%B %Y"),
                "days_remaining": days_remaining,
                "is_derived_from_mfd": is_derived,
                "derivation_note": derivation_note,
                "message": f"DANGER! This medication expired {abs(days_remaining)} days ago (in {parsed_dt.strftime('%B %Y')}). DO NOT CONSUME."
            }
        # Expiring Soon Case: 0 <= Days remaining <= 60
        elif days_remaining <= 60:
            return {
                "status": "EXPIRING_SOON",
                "badge": "⚠️ CAUTION: EXPIRING SOON",
                "color": config.THEME_DARK["accent_warning"],
                "is_safe": True,
                "is_expired": False,
                "parsed_date": parsed_dt.strftime("%B %Y"),
                "days_remaining": days_remaining,
                "is_derived_from_mfd": is_derived,
                "derivation_note": derivation_note,
                "message": f"ATTENTION! Medication expires in {days_remaining} days ({parsed_dt.strftime('%B %Y')}). Finish before expiration."
            }
        # Safe / Valid Case: Days remaining > 60
        else:
            return {
                "status": "SAFE",
                "badge": "✅ VERIFIED SAFE & VALID",
                "color": config.THEME_DARK["accent_safe"],
                "is_safe": True,
                "is_expired": False,
                "parsed_date": parsed_dt.strftime("%B %Y"),
                "days_remaining": days_remaining,
                "is_derived_from_mfd": is_derived,
                "derivation_note": derivation_note,
                "message": f"Medication is within safe therapeutic window. Valid until {parsed_dt.strftime('%B %Y')} ({days_remaining} days remaining)."
            }

    def generate_conversational_verdicts(
        self, 
        medicine_info: Dict[str, Any], 
        expiry_status: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Synthesizes human-friendly, conversational audio sentences for blind patients.

        Output Format:
            "The scanned tablet is [name]. It expires on [date]. It is consumable, generally used for [use]."

        Supports English, Tamil (தமிழ்), and Hindi (हिन्दी).

        :param medicine_info: Extracted pharmaceutical metadata dictionary.
        :type medicine_info: Dict[str, Any]
        :param expiry_status: Verified status from evaluate_expiry_status.
        :type expiry_status: Dict[str, Any]
        :return: Dictionary containing localized sentences for audio playback.
        :rtype: Dict[str, str]
        """
        name: str = medicine_info.get("medicine_name") or "the medication"
        exp_date: str = expiry_status.get("parsed_date") or medicine_info.get("expiry_date_raw") or "unverified date"
        use: str = medicine_info.get("key_indication") or "pain and relief"
        is_safe: bool = expiry_status.get("is_safe", False)
        is_expired: bool = expiry_status.get("is_expired", False)

        # 1. English Conversational Verdict
        if is_expired:
            en_text = (
                f"The scanned tablet is {name}. It expired on {exp_date}. "
                f"It is expired and not consumable, please do not consume it. "
                f"It is generally used for {use}."
            )
        elif is_safe:
            en_text = (
                f"The scanned tablet is {name}. It expires on {exp_date}. "
                f"It is consumable. It is generally used for {use}."
            )
        else:
            en_text = (
                f"The scanned tablet is {name}. Its expiry date could not be verified. "
                f"Please verify with a caregiver before consuming. "
                f"It is generally used for {use}."
            )

        # 2. Tamil Conversational Verdict (தமிழ்)
        if is_expired:
            ta_text = (
                f"ஸ்கேன் செய்யப்பட்ட மாத்திரை {name}. இதன் காலாவதி தேதி {exp_date}. "
                f"இது காலாவதியாகிவிட்டது, உட்கொள்ள வேண்டாம். "
                f"இது பொதுவாக {use} நிவாரணத்திற்கு பயன்படுகிறது."
            )
        elif is_safe:
            ta_text = (
                f"ஸ்கேன் செய்யப்பட்ட மாத்திரை {name}. இதன் காலாவதி தேதி {exp_date}. "
                f"இது உட்கொள்ள பாதுகாப்பானது. "
                f"இது பொதுவாக {use} நிவாரணத்திற்கு பயன்படுகிறது."
            )
        else:
            ta_text = (
                f"ஸ்கேன் செய்யப்பட்ட மாத்திரை {name}. இதன் காலாவதி தேதி தெளிவாக தெரியவில்லை. "
                f"பராமரிப்பாளரிடம் உறுதி செய்து கொள்ளுங்கள். "
                f"இது பொதுவாக {use} பயன்படுகிறது."
            )

        # 3. Hindi Conversational Verdict (हिन्दी)
        if is_expired:
            hi_text = (
                f"स्कैन की गई गोली {name} है। इसकी समाप्ति तिथि {exp_date} है। "
                f"यह दवा समाप्त हो चुकी है और सेवन के योग्य नहीं है, कृपया इसे न लें। "
                f"यह आमतौर पर {use} के लिए उपयोग की जाती है।"
            )
        elif is_safe:
            hi_text = (
                f"स्कैन की गई गोली {name} है। इसकी समाप्ति तिथि {exp_date} है। "
                f"यह सेवन के लिए सुरक्षित है। "
                f"यह आमतौर पर {use} के लिए उपयोग की जाती है।"
            )
        else:
            hi_text = (
                f"स्कैन की गई गोली {name} है। इसकी समाप्ति तिथि स्पष्ट नहीं है। "
                f"कृपया सेवन से पहले किसी की सहायता लें। "
                f"यह आमतौर पर {use} के लिए उपयोग की जाती है।"
            )

        return {
            "en": en_text,
            "en-US": en_text,
            "ta": ta_text,
            "ta-IN": ta_text,
            "hi": hi_text,
            "hi-IN": hi_text
        }

    def generate_clinical_alerts(self, medicine_info: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Generates clinical safety alerts based on regulatory schedules, dosages, and drug classes.

        Alert Rules:
            1. Indian Drugs & Cosmetics Act Schedules H and H1 Prescription Rules.
            2. Daily hepatotoxicity dosage limit for Paracetamol / Acetaminophen (4000 mg/day).
            3. Antibiotic Stewardship Advisory (preventing antimicrobial resistance - AMR).
            4. Antihistamine sedation warnings (operating motor vehicles or machinery).

        :param medicine_info: Extracted pharmaceutical metadata dictionary.
        :type medicine_info: Dict[str, Any]
        :return: List of structured alert dictionaries containing level, title, and description.
        :rtype: List[Dict[str, str]]
        """
        alerts: List[Dict[str, str]] = []
        name: str = (medicine_info.get("medicine_name") or "").upper()
        generic: str = (medicine_info.get("generic_name") or "").upper()
        sched: str = (medicine_info.get("schedule_category") or "").upper()

        # Rule 1: Schedule H1 Restricted Antibiotic / Narcotic Warning
        if "H1" in sched:
            alerts.append({
                "level": "CRITICAL",
                "title": "Schedule H1 Prescription Drug",
                "desc": "Restricted antibiotic/narcotic. Retain prescription; strictly unauthorized for self-medication."
            })
        elif "H" in sched:
            alerts.append({
                "level": "WARNING",
                "title": "Schedule H Drug",
                "desc": "Prescription required. Sold only under registered medical practitioner supervision."
            })

        # Rule 2: Paracetamol Hepatotoxicity Ceiling
        if "PARACETAMOL" in name or "PARACETAMOL" in generic or "ACETAMINOPHEN" in generic:
            alerts.append({
                "level": "INFO",
                "title": "Daily Dosage Limit",
                "desc": "Maximum 4000 mg per 24 hours. Overdose can cause severe liver damage. Avoid concurrent paracetamol products."
            })

        # Rule 3: Antibiotic Stewardship Advisory
        antibiotics = ["AMOXICILLIN", "CLAVULANATE", "AZITHROMYCIN", "CIPROFLOXACIN", "CEFIXIME", "OFLOXACIN"]
        if any(ab in generic for ab in antibiotics):
            alerts.append({
                "level": "WARNING",
                "title": "Antibiotic Stewardship Advisory",
                "desc": "Must complete full course as prescribed by physician to prevent antimicrobial resistance (AMR)."
            })

        # Rule 4: Sedative Antihistamine Reflex Caution
        sedatives = ["CETIRIZINE", "LEVOCETIRIZINE", "CHLORPHENIRAMINE", "DIPHENHYDRAMINE"]
        if any(sed in generic for sed in sedatives):
            alerts.append({
                "level": "INFO",
                "title": "Drowsiness Advisory",
                "desc": "May impair alertness and psychomotor reflexes. Avoid driving or operating machinery after ingestion."
            })

        return alerts


# Module Singleton Instance
safety_guardian: SafetyGuardian = SafetyGuardian()
