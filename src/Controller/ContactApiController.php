<?php
namespace App\Controller;

use App\Entity\Contact;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class ContactApiController
{
    #[Route('/api/contact', name: 'api_contact_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // On accepte JSON et FormData
        $contentType = $request->headers->get('Content-Type', '');
        if (str_contains($contentType, 'application/json')) {
            $data = json_decode($request->getContent(), true) ?? [];
        } else {
            $data = $request->request->all(); // FormData
        }

        foreach (['nom','email','message'] as $k) {
            if (empty($data[$k])) {
                return new JsonResponse(['ok' => false, 'error' => "Champ manquant: $k"], 422);
            }
        }

        // (Optionnel) validations légères
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['ok' => false, 'error' => "Email invalide"], 422);
        }

        $contact = (new Contact())
            ->setNom($data['nom'])
            ->setEmail($data['email'])
            ->setMessage($data['message']);

        $em->persist($contact);
        $em->flush();

        return new JsonResponse(['ok' => true, 'id' => $contact->getId()], 201);
    }

    // Bonus: récupérer la liste (pour tester)
    #[Route('/api/contact', name: 'api_contact_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $rows = $em->getRepository(Contact::class)->findBy([], ['id' => 'DESC'], 50);
        $data = array_map(fn(Contact $c) => [
            'id' => $c->getId(),
            'nom' => $c->getNom(),
            'email' => $c->getEmail(),
            'message' => $c->getMessage(),
            'createdAt' => $c->getCreatedAt()->format(DATE_ATOM),
        ], $rows);

        return new JsonResponse($data, 200);
    }
}
