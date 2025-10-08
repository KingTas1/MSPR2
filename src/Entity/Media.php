<?php

namespace App\Entity;

use Vich\UploaderBundle\Mapping\Annotation as Vich;
use Symfony\Component\HttpFoundation\File\File;
use App\Repository\MediaRepository;
use Doctrine\ORM\Mapping as ORM;

// #[ORM\Entity(repositoryClass: MediaRepository::class)]
// class Media
// {
//     #[ORM\Id]
//     #[ORM\GeneratedValue]
//     #[ORM\Column]
//     private ?int $id = null;

//     public function getId(): ?int
//     {
//         return $this->id;
//     }
// }

class Media
{
    // ...
    #[Vich\UploadableField(mapping: 'media_file', fileNameProperty: 'fileName', size: 'size', mimeType: 'mimeType', originalName: 'originalName')]
    private ?File $file = null;

    public function setFile(?File $file): void
    {
        $this->file = $file;
        if ($file) { $this->createdAt = new \DateTimeImmutable(); }
    }
    public function getFile(): ?File { return $this->file; }
}