<?php

namespace App\Controller;

use App\Entity\Rdv;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use DateTimeImmutable;

class RdvController
{
    #[Route('/api/rdv', name: 'api_rdv_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);

        // Validations très simples (tu peux brancher le Validator après)
        foreach (['nom','email','telephone','adresse','dateRdv'] as $k) {
            if (empty($payload[$k])) {
                return new JsonResponse(['error' => "Champ manquant: $k"], 422);
            }
        }

        try {
            $date = new DateTimeImmutable($payload['dateRdv']); 
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => 'dateRdv invalide (ISO 8601 requis)'], 422);
        }

        $rdv = new Rdv();
        $rdv->setNom($payload['nom']);
        $rdv->setEmail($payload['email']);
        $rdv->setTelephone($payload['telephone']);
        $rdv->setAdresse($payload['adresse']);
        $rdv->setDateRdv($date);
        if (!empty($payload['commentaire'])) {
            $rdv->setCommentaire($payload['commentaire']);
        }
        if (method_exists($rdv, 'setCreatedAt')) {
            $rdv->setCreatedAt(new DateTimeImmutable());
        }

        $em->persist($rdv);
        $em->flush();

        return new JsonResponse([
            'id' => $rdv->getId(),
            'message' => 'RDV créé',
        ], 201);
    }

    #[Route('/api/rdv', name: 'api_rdv_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $data = [];
        foreach ($em->getRepository(Rdv::class)->findBy([], ['dateRdv' => 'ASC']) as $r) {
            $data[] = [
                'id' => $r->getId(),
                'nom' => $r->getNom(),
                'email' => $r->getEmail(),
                'telephone' => $r->getTelephone(),
                'adresse' => $r->getAdresse(),
                'dateRdv' => $r->getDateRdv()->format(DATE_ATOM),
            ];
        }
        return new JsonResponse($data);
    }
}


// namespace App\Controller;

// use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
// use Symfony\Component\HttpFoundation\Response;
// use Symfony\Component\Routing\Attribute\Route;

// final class RdvController extends AbstractController
// {
//     // #[Route('/rdv', name: 'app_rdv')]
//     // public function index(): Response
//     // {
//     //     return $this->render('rdv/index.html.twig', [
//     //         'controller_name' => 'RdvController',
//     //     ]);
//     // }
//     #[Route('/rdv', name: 'rdv_page', methods: ['GET'])]
//     public function rdv(): Response
//     {
//         return $this->render('rdv/index.html.twig');
//     }
// }
