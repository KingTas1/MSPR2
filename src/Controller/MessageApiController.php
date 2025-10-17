<?php
namespace App\Controller;

use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class MessageApiController
{
    public function __construct(private EntityManagerInterface $em) {}

    #[Route('/api/message', name: 'api_message_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        // Accepte JSON ou FormData
        $ct = $request->headers->get('Content-Type', '');
        $data = str_contains($ct, 'application/json')
            ? (json_decode($request->getContent(), true) ?? [])
            : $request->request->all();

        // Compat: accepter 'text' OU ancien 'contenu'
        $payloadText = $data['text'] ?? $data['contenu'] ?? null;

        // Champs requis côté entité: nom, phone, text
        foreach (['nom','phone'] as $k) {
            if (empty($data[$k])) {
                return new JsonResponse(['ok' => false, 'error' => "Champ manquant: $k"], 422);
            }
        }
        if (empty($payloadText)) {
            return new JsonResponse(['ok' => false, 'error' => "Champ manquant: text"], 422);
        }

        // Email optionnel, mais on valide si fourni
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['ok' => false, 'error' => "Email invalide"], 422);
        }

        $msg = (new Message())
            ->setNom($data['nom'])
            ->setEmail($data['email'] ?? null)     // nullable
            ->setPhone($data['phone'])
            ->setText($payloadText)                // correspond à ton champ 'text'
            ->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($msg);
        $this->em->flush();

        return new JsonResponse(['ok' => true, 'id' => $msg->getId()], 201);
    }
}
