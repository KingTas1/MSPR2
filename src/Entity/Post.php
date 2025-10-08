<?php

namespace App\Entity;

use App\Repository\PostRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post as ApiPost;

#[ORM\Entity(repositoryClass: PostRepository::class)]
class Post
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    public function getId(): ?int
    {
        return $this->id;
    }
}

// #[ApiResource(
//   operations: [
//     new GetCollection(normalizationContext: ['groups' => ['post:list']]),
//     new Get(normalizationContext: ['groups' => ['post:item']]),
//     new ApiPost(denormalizationContext: ['groups' => ['post:write']]),
//   ]
// )]
// class Post
// {
//    // ajoute des #[Groups(['post:list', 'post:item', 'post:write'])] sur les props utiles
// }