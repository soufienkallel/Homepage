<!-- Copie de référence de la migration supabase/migrations/20260925100600_agent_knowledge_rebuild.sql.
     Aucun code ne lit ce fichier : la source live est la table agent_knowledge
     (voir /admin/knowledge). Toute modification passe par une nouvelle migration. -->

# MALLOULIAUTO — Faits vérifiés

> Ne cite que ces faits et les chiffres produit fournis à part. Si une information manque, dis-le et propose le contact.

## Le rapport
- Contenu : identification et photos du véhicule, contexte et objet de l'inspection, matériel utilisé, constats par famille avec photo, gravité et coût estimé, tableaux de mesures (épaisseur de peinture par panneau, profondeur de sculpture par pneu, niveaux, températures), cohérence kilométrique multi-calculateurs, codes défaut, synthèse de l'inspecteur et total estimé des réparations. Sa longueur dépend du périmètre inspecté et du nombre de constats.
- Gravité par constat, sur trois niveaux : Mineure, Modérée, Majeure.
- Pas de note globale, pas de score, pas de grade.
- Pas de recommandation d'achat : chaque constat est chiffré et le rapport en donne la conséquence sur le prix. La décision reste au client.
- Vérification : chaque rapport porte une référence unique et un QR code menant à une page permanente. Elle confirme l'authenticité du document, sa date d'émission et l'inspecteur, sans avoir à contacter MALLOULIAUTO.

## L'inspection
- Durée : 30 à 60 minutes sur place, sans démontage, selon l'état du véhicule. La durée exacte figure dans le rapport.
- Lieu : chez le client, chez le vendeur ou dans les locaux MALLOULIAUTO. L'inspecteur se déplace avec son matériel.
- Elle ne remplace pas la visite technique : elle documente ce que celle-ci ne couvre pas (historique de réparation, cohérence du kilométrage, épaisseur de peinture, coût des remises en état).
- Limites : une inspection sans démontage ne voit pas l'usure interne d'un moteur ou d'une boîte, ni une panne intermittente absente le jour du contrôle. Les éléments hors périmètre sont nommés dans le rapport.
- Codes défaut : ils sont relevés et reportés. Un code oriente vers un système à contrôler ; il ne désigne pas à lui seul la pièce défaillante.

## Ce que le rapport ne fait pas
- Pas de mesure structurelle ni de géométrie du châssis : le châssis fait partie des points inspectés (sous-famille de l'Enveloppe extérieure), sa structure n'est pas mesurée.
- Pas de taux de confiance sur des détections automatiques : les constats du rapport sont ceux de l'inspecteur.
- Pas de recommandation d'achat ou de vente : une conséquence de prix chiffrée.
- Pas d'historique complet du véhicule.

## Contact
- info@mallouliauto.com
- Prise de rendez-vous : lien de réservation fourni dans le prompt.
