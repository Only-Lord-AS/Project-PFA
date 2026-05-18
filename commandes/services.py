import os
from datetime import datetime
from decimal import Decimal
from django.conf import settings

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

# Couleurs branding
BLEU_FONCE = colors.HexColor('#2C3E50')
BLEU_CLAIR = colors.HexColor('#3498DB')
GRIS_CLAIR = colors.HexColor('#ECF0F1')
GRIS_MOYEN = colors.HexColor('#BDC3C7')
BLANC = colors.white
NOIR = colors.black


def _get_styles():
    """Retourne les styles personnalisés pour la facture."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name='FactureTitre',
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=BLEU_FONCE,
        alignment=TA_LEFT,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name='SousTitre',
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#7F8C8D'),
        alignment=TA_LEFT,
        spaceAfter=2,
    ))
    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=BLEU_FONCE,
        spaceBefore=14,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name='InfoClient',
        fontName='Helvetica',
        fontSize=10,
        textColor=NOIR,
        leading=14,
    ))
    styles.add(ParagraphStyle(
        name='PiedPage',
        fontName='Helvetica-Oblique',
        fontSize=8,
        textColor=colors.HexColor('#95A5A6'),
        alignment=TA_CENTER,
        spaceBefore=20,
    ))
    return styles


def generer_facture_pdf(commande):
    """
    Génère une facture PDF professionnelle pour une DemandeAchat.
    
    Args:
        commande: instance de DemandeAchat (avec details, id_acheteur, transaction_paiement)
    
    Returns:
        str: chemin relatif du fichier PDF (ex: 'factures/FAC-A1B2C3D4.pdf')
    """
    # Créer le répertoire si nécessaire
    facture_dir = os.path.join(settings.MEDIA_ROOT, 'factures')
    os.makedirs(facture_dir, exist_ok=True)

    filename = f"FAC-{commande.reference}.pdf"
    filepath = os.path.join(facture_dir, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=2 * cm,
    )

    styles = _get_styles()
    elements = []

    # ===================================================================
    # EN-TÊTE : Logo texte + adresse + numéro facture + date
    # ===================================================================
    header_data = [
        [
            Paragraph("MarocShop B2B", styles['FactureTitre']),
            Paragraph(
                f"<b>FACTURE N° FAC-{commande.reference}</b><br/>"
                f"Date : {commande.date_commande.strftime('%d/%m/%Y')}<br/>"
                f"Heure : {commande.date_commande.strftime('%H:%M')}",
                styles['InfoClient']
            ),
        ],
        [
            Paragraph(
                "Plateforme Marketplace B2B<br/>"
                "Casablanca, Maroc<br/>"
                "contact@marocshop.ma",
                styles['SousTitre']
            ),
            '',
        ],
    ]
    header_table = Table(header_data, colWidths=[10 * cm, 7 * cm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(header_table)

    # Ligne de séparation
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(HRFlowable(width="100%", thickness=2, color=BLEU_FONCE))
    elements.append(Spacer(1, 0.5 * cm))

    # ===================================================================
    # BLOC CLIENT
    # ===================================================================
    elements.append(Paragraph("Informations Client", styles['SectionHeader']))

    acheteur = commande.id_acheteur
    adresse = acheteur.adresse_livraison or "Non renseignée"

    client_data = [
        ['Nom :', acheteur.nom_complet],
        ['Email :', acheteur.email],
        ['Téléphone :', acheteur.telephone or 'Non renseigné'],
        ['Adresse de livraison :', adresse],
    ]
    client_table = Table(client_data, colWidths=[5 * cm, 12 * cm])
    client_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), BLEU_FONCE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(client_table)
    elements.append(Spacer(1, 0.5 * cm))

    # ===================================================================
    # TABLEAU DES ARTICLES
    # ===================================================================
    elements.append(Paragraph("Détail des articles", styles['SectionHeader']))

    table_data = [['Désignation', 'Qté', 'Prix Unitaire HT', 'Montant HT']]

    sous_total_ht = Decimal('0.00')
    for detail in commande.details.select_related('id_article').all():
        designation = detail.id_article.designation if detail.id_article else "Article supprimé"
        montant_ligne = detail.quantite_commandee * detail.prix_unitaire_fixe
        sous_total_ht += montant_ligne
        table_data.append([
            designation,
            str(detail.quantite_commandee),
            f"{detail.prix_unitaire_fixe:.2f} MAD",
            f"{montant_ligne:.2f} MAD",
        ])

    articles_table = Table(table_data, colWidths=[8 * cm, 2 * cm, 3.5 * cm, 3.5 * cm])

    # Zebra stripes
    table_style_cmds = [
        # En-tête
        ('BACKGROUND', (0, 0), (-1, 0), BLEU_FONCE),
        ('TEXTCOLOR', (0, 0), (-1, 0), BLANC),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        # Contenu
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS_MOYEN),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
    ]

    # Appliquer zebra stripes aux lignes de données
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            table_style_cmds.append(('BACKGROUND', (0, i), (-1, i), GRIS_CLAIR))

    articles_table.setStyle(TableStyle(table_style_cmds))
    elements.append(articles_table)
    elements.append(Spacer(1, 0.3 * cm))

    # ===================================================================
    # PIED DE TABLEAU : Totaux
    # ===================================================================
    tva = commande.montant_ttc - commande.montant_ht

    totaux_data = [
        ['', '', 'Sous-total HT', f"{commande.montant_ht:.2f} MAD"],
        ['', '', 'TVA (20%)', f"{tva:.2f} MAD"],
        ['', '', 'TOTAL TTC', f"{commande.montant_ttc:.2f} MAD"],
    ]
    totaux_table = Table(totaux_data, colWidths=[8 * cm, 2 * cm, 3.5 * cm, 3.5 * cm])
    totaux_table.setStyle(TableStyle([
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
        ('LINEABOVE', (2, 0), (-1, 0), 1, BLEU_FONCE),
        # Ligne Total TTC en gras et fond bleu
        ('BACKGROUND', (2, 2), (-1, 2), BLEU_FONCE),
        ('TEXTCOLOR', (2, 2), (-1, 2), BLANC),
        ('FONTNAME', (2, 2), (-1, 2), 'Helvetica-Bold'),
        ('FONTSIZE', (2, 2), (-1, 2), 12),
        ('TOPPADDING', (2, 2), (-1, 2), 8),
        ('BOTTOMPADDING', (2, 2), (-1, 2), 8),
    ]))
    elements.append(totaux_table)
    elements.append(Spacer(1, 0.8 * cm))

    # ===================================================================
    # SECTION PAIEMENT
    # ===================================================================
    elements.append(Paragraph("Informations de paiement", styles['SectionHeader']))

    # Récupérer la transaction liée
    try:
        transaction_paiement = commande.transaction_paiement
        methode_display = dict(transaction_paiement.METHODE_CHOICES).get(
            transaction_paiement.methode, transaction_paiement.methode
        )
        statut_display = dict(transaction_paiement.STATUT_CHOICES).get(
            transaction_paiement.statut, transaction_paiement.statut
        )
        paiement_data = [
            ['Méthode :', methode_display],
            ['Référence :', str(transaction_paiement.reference_transaction)],
            ['Statut :', statut_display],
            ['Date :', transaction_paiement.date_transaction.strftime('%d/%m/%Y %H:%M')],
        ]
        if transaction_paiement.donnees_carte_masquees:
            paiement_data.append(['Carte :', transaction_paiement.donnees_carte_masquees])
    except Exception:
        paiement_data = [['Statut :', 'Information de paiement non disponible']]

    paiement_table = Table(paiement_data, colWidths=[5 * cm, 12 * cm])
    paiement_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), BLEU_FONCE),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, 0), (-1, -1), GRIS_CLAIR),
        ('BOX', (0, 0), (-1, -1), 0.5, GRIS_MOYEN),
    ]))
    elements.append(paiement_table)

    # ===================================================================
    # PIED DE PAGE
    # ===================================================================
    elements.append(Spacer(1, 1.5 * cm))
    elements.append(HRFlowable(width="100%", thickness=1, color=GRIS_MOYEN))
    elements.append(Spacer(1, 0.3 * cm))

    date_generation = datetime.now().strftime('%d/%m/%Y à %H:%M')
    elements.append(Paragraph(
        f"Facture générée le {date_generation} — Merci pour votre commande !<br/>"
        f"MarocShop B2B — Plateforme Marketplace Sécurisée",
        styles['PiedPage']
    ))

    # Construire le PDF
    doc.build(elements)

    return f"factures/{filename}"
